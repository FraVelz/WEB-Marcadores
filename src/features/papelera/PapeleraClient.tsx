"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "@pheralb/toast"

import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { daysLeftInTrash, trashPurgeAt, TRASH_RETENTION_DAYS } from "@/lib/agent/constants"
import type { TrashItem } from "@/features/marcadores/utils/types"
import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"

function toTrashItems(
  bookmarks: Array<{
    id: string
    title: string
    url: string
    deleted_at: string
    deleted_batch_id: string | null
  }>,
  folders: Array<{
    id: string
    name: string
    deleted_at: string
    deleted_batch_id: string | null
  }>
): TrashItem[] {
  const items: TrashItem[] = []
  for (const b of bookmarks) {
    items.push({
      type: "bookmark",
      id: b.id,
      title: b.title,
      url: b.url,
      deleted_at: b.deleted_at,
      deleted_batch_id: b.deleted_batch_id,
      purge_at: trashPurgeAt(b.deleted_at).toISOString(),
      days_left: daysLeftInTrash(b.deleted_at),
    })
  }
  for (const f of folders) {
    items.push({
      type: "folder",
      id: f.id,
      name: f.name,
      deleted_at: f.deleted_at,
      deleted_batch_id: f.deleted_batch_id,
      purge_at: trashPurgeAt(f.deleted_at).toISOString(),
      days_left: daysLeftInTrash(f.deleted_at),
    })
  }
  return items.sort((a, b) => b.deleted_at.localeCompare(a.deleted_at))
}

export function PapeleraClient() {
  const { demoMode } = useDashboard()
  const supabase = createClient()
  const [items, setItems] = useState<TrashItem[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (demoMode) {
      setItems([])
      setLoading(false)
      return
    }
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setItems([])
      setLoading(false)
      return
    }
    const [{ data: bookmarks }, { data: folders }] = await Promise.all([
      supabase
        .from("bookmarks")
        .select("id, title, url, deleted_at, deleted_batch_id")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false }),
      supabase
        .from("folders")
        .select("id, name, deleted_at, deleted_batch_id")
        .eq("user_id", user.id)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false }),
    ])
    const bookmarkRows = (bookmarks ?? []) as Array<{
      id: string
      title: string
      url: string
      deleted_at: string | null
      deleted_batch_id: string | null
    }>
    const folderRows = (folders ?? []) as Array<{
      id: string
      name: string
      deleted_at: string | null
      deleted_batch_id: string | null
    }>
    setItems(
      toTrashItems(
        bookmarkRows.filter((b): b is typeof b & { deleted_at: string } => Boolean(b.deleted_at)),
        folderRows.filter((f): f is typeof f & { deleted_at: string } => Boolean(f.deleted_at))
      )
    )
    setLoading(false)
  }, [demoMode, supabase])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const restore = async (item: TrashItem) => {
    if (demoMode) return
    setBusyId(item.id)
    try {
      if (item.deleted_batch_id) {
        await Promise.all([
          supabase
            .from("bookmarks")
            .update({ deleted_at: null, deleted_batch_id: null })
            .eq("deleted_batch_id", item.deleted_batch_id),
          supabase
            .from("folders")
            .update({ deleted_at: null, deleted_batch_id: null })
            .eq("deleted_batch_id", item.deleted_batch_id),
        ])
      } else {
        const table = item.type === "bookmark" ? "bookmarks" : "folders"
        await supabase.from(table).update({ deleted_at: null, deleted_batch_id: null }).eq("id", item.id)
      }
      toast.success({ text: "Restaurado" })
      await refresh()
    } catch (error) {
      toast.error({ text: error instanceof Error ? error.message : "No se pudo restaurar" })
    } finally {
      setBusyId(null)
    }
  }

  const purge = async (item: TrashItem) => {
    if (demoMode) return
    if (!window.confirm("¿Eliminar definitivamente? Esta acción no se puede deshacer.")) return
    setBusyId(item.id)
    try {
      if (item.deleted_batch_id) {
        await Promise.all([
          supabase.from("bookmarks").delete().eq("deleted_batch_id", item.deleted_batch_id),
          supabase.from("folders").delete().eq("deleted_batch_id", item.deleted_batch_id),
        ])
      } else {
        const table = item.type === "bookmark" ? "bookmarks" : "folders"
        await supabase.from(table).delete().eq("id", item.id)
      }
      toast.success({ text: "Eliminado definitivamente" })
      await refresh()
    } catch (error) {
      toast.error({ text: error instanceof Error ? error.message : "No se pudo eliminar" })
    } finally {
      setBusyId(null)
    }
  }

  const emptyAll = async () => {
    if (demoMode) return
    if (!window.confirm("¿Vaciar toda la papelera de forma permanente?")) return
    setBusyId("empty")
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      await Promise.all([
        supabase.from("bookmarks").delete().eq("user_id", user.id).not("deleted_at", "is", null),
        supabase.from("folders").delete().eq("user_id", user.id).not("deleted_at", "is", null),
      ])
      toast.success({ text: "Papelera vaciada" })
      await refresh()
    } catch (error) {
      toast.error({ text: error instanceof Error ? error.message : "No se pudo vaciar" })
    } finally {
      setBusyId(null)
    }
  }

  if (demoMode) {
    return (
      <p className="text-app-fg-muted text-sm">
        La papelera no está disponible en modo demo. Inicia sesión para usarla.
      </p>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-app-fg-secondary text-sm">
          Los elementos se eliminan automáticamente tras {TRASH_RETENTION_DAYS} días.
        </p>
        <button
          type="button"
          disabled={items.length === 0 || busyId === "empty"}
          onClick={() => void emptyAll()}
          className={cn(
            "border-app-input-border text-app-fg-secondary rounded-lg border px-3 py-1.5 text-sm",
            FOCUS_RING,
            "hover:bg-app-raised-muted cursor-pointer disabled:opacity-50"
          )}
        >
          Vaciar papelera
        </button>
      </div>

      {loading ? (
        <p className="text-app-fg-muted text-sm">Cargando…</p>
      ) : items.length === 0 ? (
        <p className="text-app-fg-muted text-sm">La papelera está vacía.</p>
      ) : (
        <ul className="divide-app-border border-app-border divide-y rounded-lg border">
          {items.map((item) => {
            const label = item.type === "bookmark" ? item.title : item.name
            return (
              <li key={`${item.type}-${item.id}`} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-app-fg truncate font-medium">{label}</p>
                  <p className="text-app-fg-muted text-xs">
                    {item.type === "bookmark" ? "Marcador" : "Carpeta"} · {item.days_left}d restantes
                    {item.deleted_batch_id ? " · lote" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void restore(item)}
                    className={cn(
                      "bg-app-primary rounded-lg px-3 py-1.5 text-sm font-medium text-white",
                      FOCUS_RING,
                      "hover:bg-app-primary-hover cursor-pointer disabled:opacity-50"
                    )}
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void purge(item)}
                    className={cn(
                      "border-app-input-border text-app-fg-secondary rounded-lg border px-3 py-1.5 text-sm",
                      FOCUS_RING,
                      "hover:bg-app-raised-muted cursor-pointer disabled:opacity-50"
                    )}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
