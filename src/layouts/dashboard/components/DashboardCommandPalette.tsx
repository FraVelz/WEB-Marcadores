"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"

import Link from "next/link"

import { useDashboard } from "@/contexts/DashboardContext"

import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"

function norm(s: string) {
  return s.trim().toLowerCase()
}

export function DashboardCommandPalette() {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const { commandPaletteOpen, setCommandPaletteOpen, marcadoresPalette } = useDashboard()

  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!commandPaletteOpen) return
    queueMicrotask(() => {
      setQuery("")
    })
    const t = requestAnimationFrame(() => inputRef.current?.focus())
    return () => cancelAnimationFrame(t)
  }, [commandPaletteOpen])

  const bookmarkHits = useMemo(() => {
    const palette = marcadoresPalette
    const q = norm(query)
    if (!palette || !q || q.length < 2) return []
    let matchRe: RegExp
    try {
      matchRe = new RegExp(q.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"))
    } catch {
      return []
    }
    const out: { id: string; title: string; url: string }[] = []
    for (const b of palette.bookmarks) {
      const hay = `${b.title} ${b.url}`.toLowerCase()
      if (matchRe.test(hay)) out.push(b)
      if (out.length >= 25) break
    }
    return out
  }, [marcadoresPalette, query])

  const close = () => setCommandPaletteOpen(false)

  if (!commandPaletteOpen) return null

  const selectBookmark = (b: { id: string; title: string; url: string }) => {
    window.open(b.url, "_blank", "noopener,noreferrer")
    void marcadoresPalette?.recordBookmarkOpened(b.id)
    close()
  }

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-labelledby={`${id}-title`}>
      <button
        type="button"
        className="bg-app-overlay-strong absolute inset-0 cursor-default border-0"
        aria-label="Cerrar paleta"
        onClick={close}
      />
      <div className="border-app-border bg-app-sidebar absolute top-[10vh] left-1/2 flex w-[min(640px,92vw)] -translate-x-1/2 flex-col rounded-xl border shadow-xl">
        <div className="border-app-border-muted border-b px-3 py-2">
          <label htmlFor={`${id}-input`} className="sr-only" id={`${id}-title`}>
            Buscar marcadores
          </label>
          <input
            id={`${id}-input`}
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Marcador…"
            className="placeholder:text-app-fg-muted bg-app-hover text-app-fg focus:border-app-input-border focus:ring-app-focus w-full rounded-md border border-transparent px-3 py-2 text-sm outline-none focus:ring-1"
            onKeyDown={(e) => {
              if (e.key === "Escape") close()
            }}
          />
          <div className="text-app-fg-muted mt-1 text-[11px]">Ctrl/Cmd + K · Busca y pulsa resultado</div>
        </div>

        <div className="max-h-[60vh] min-h-[120px] overflow-y-auto p-2">
          <div className="text-app-fg-muted mb-1 px-2 text-[11px] font-semibold tracking-wide uppercase">Atajos</div>
          <div className="mb-3 flex flex-col gap-1">
            <ShortcutPaletteLink title="Marcadores" hint="Gestor principal" href="/marcadores" onNavigate={close} />
            <ShortcutPaletteLink title="Perfil" hint="Preferencias & cuenta" href="/perfil" onNavigate={close} />
          </div>

          <div className="text-app-fg-muted mt-3 mb-1 px-2 text-[11px] font-semibold tracking-wide uppercase">
            Marcadores
          </div>
          {bookmarkHits.length === 0 ? (
            <EmptyRow
              text={
                query.trim().length < 2 ? "Escribe al menos 2 caracteres para buscar marcadores." : "Sin coincidencias"
              }
            />
          ) : (
            bookmarkHits.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => selectBookmark(b)}
                className={cn(
                  "hover:bg-app-hover flex w-full items-start gap-3 rounded-md p-2 text-left",
                  FOCUS_RING
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-app-fg truncate text-sm font-medium">{b.title}</div>
                  <div className="text-app-fg-muted truncate text-[11px]">{b.url}</div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <div className="text-app-fg-muted px-3 py-2 text-sm">{text}</div>
}

function ShortcutPaletteLink(props: { title: string; hint?: string; href: string; onNavigate: () => void }) {
  return (
    <Link
      href={props.href}
      onClick={props.onNavigate}
      className={cn("hover:bg-app-hover text-app-fg flex w-full items-center justify-between rounded-md p-2 text-sm no-underline", FOCUS_RING)}
    >
      <span className="font-medium">{props.title}</span>
      {props.hint ? <span className="text-app-fg-muted text-xs">{props.hint}</span> : null}
    </Link>
  )
}
