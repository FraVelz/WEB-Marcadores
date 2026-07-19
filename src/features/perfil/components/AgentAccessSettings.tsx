"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "@pheralb/toast"

import { AGENT_SCOPES, type AgentScope } from "@/lib/agent/constants"
import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"

type TokenRow = {
  id: string
  name: string
  prefix: string
  scopes: string[]
  expires_at: string | null
  created_at: string
  last_used_at: string | null
  revoked_at: string | null
}

export function AgentAccessSettings({ enabled }: { enabled: boolean }) {
  const [tokens, setTokens] = useState<TokenRow[]>([])
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [scopes, setScopes] = useState<AgentScope[]>(["bookmarks:read", "trash:read"])
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    try {
      const res = await fetch("/api/agent/v1/tokens", { credentials: "include" })
      const json = (await res.json()) as { tokens?: TokenRow[]; error?: { message: string } }
      if (!res.ok) throw new Error(json.error?.message ?? "No se pudieron cargar los tokens")
      setTokens(json.tokens ?? [])
    } catch (error) {
      toast.error({ text: error instanceof Error ? error.message : "Error al cargar tokens" })
    } finally {
      setLoading(false)
    }
  }, [enabled])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const toggleScope = (scope: AgentScope) => {
    setScopes((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]))
  }

  const createToken = async () => {
    if (!name.trim() || scopes.length === 0) return
    setCreating(true)
    try {
      const res = await fetch("/api/agent/v1/tokens", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim(), scopes }),
      })
      const json = (await res.json()) as {
        secret?: string
        error?: { message: string }
      }
      if (!res.ok) throw new Error(json.error?.message ?? "No se pudo crear el token")
      setCreatedSecret(json.secret ?? null)
      setName("")
      toast.success({ text: "Token creado — cópialo ahora, no se volverá a mostrar" })
      await refresh()
    } catch (error) {
      toast.error({ text: error instanceof Error ? error.message : "Error al crear token" })
    } finally {
      setCreating(false)
    }
  }

  const revoke = async (id: string) => {
    if (!window.confirm("¿Revocar este token?")) return
    try {
      const res = await fetch(`/api/agent/v1/tokens/${id}/revoke`, {
        method: "POST",
        credentials: "include",
      })
      const json = (await res.json()) as { error?: { message: string } }
      if (!res.ok) throw new Error(json.error?.message ?? "No se pudo revocar")
      toast.success({ text: "Token revocado" })
      await refresh()
    } catch (error) {
      toast.error({ text: error instanceof Error ? error.message : "Error al revocar" })
    }
  }

  if (!enabled) {
    return (
      <div className="border-app-border-muted bg-app-raised rounded-lg border p-6">
        <h2 className="text-app-fg mb-2 text-lg font-semibold">Agent Access (MCP / API)</h2>
        <p className="text-app-fg-muted text-sm">
          No disponible en modo demo. Inicia sesión en un entorno con{" "}
          <code className="text-xs">SUPABASE_SERVICE_ROLE_KEY</code> configurada.
        </p>
      </div>
    )
  }

  return (
    <div className="border-app-border-muted bg-app-raised space-y-4 rounded-lg border p-6">
      <div>
        <h2 className="text-app-fg text-lg font-semibold">Claves para agentes de IA (MCP / API)</h2>
        <p className="text-app-fg-secondary mt-1 text-sm">
          Aquí creas la clave que pegarás en tu agente (Cursor, Claude Code, Codex, etc.). Empieza por{" "}
          <code className="text-xs">wm_</code> y solo se muestra una vez. Guía completa: en Marcadores pulsa el botón{" "}
          <strong>MCP</strong> de la cabecera.
        </p>
      </div>

      {createdSecret ? (
        <div className="border-app-border bg-app-raised-muted rounded-lg border p-3">
          <p className="text-app-fg-secondary mb-2 text-xs font-medium">Secret (se muestra solo una vez)</p>
          <code className="text-app-fg block text-sm break-all">{createdSecret}</code>
          <button
            type="button"
            className={cn("text-app-primary mt-2 text-sm underline", FOCUS_RING)}
            onClick={() => {
              void navigator.clipboard.writeText(createdSecret)
              toast.success({ text: "Copiado" })
            }}
          >
            Copiar
          </button>
        </div>
      ) : null}

      <div className="space-y-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del token (ej. Cursor, Claude)"
          aria-label="Nombre del token"
          className={cn(
            "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-4 py-2",
            "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
          )}
        />
        <div className="flex flex-wrap gap-2">
          {AGENT_SCOPES.map((scope) => (
            <label
              key={scope}
              className={cn(
                "border-app-input-border inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2 py-1 text-xs",
                scopes.includes(scope) ? "bg-app-primary/15 border-app-primary" : "bg-app-raised-muted"
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={scopes.includes(scope)}
                onChange={() => toggleScope(scope)}
              />
              {scope}
            </label>
          ))}
        </div>
        <button
          type="button"
          disabled={creating || !name.trim() || scopes.length === 0}
          onClick={() => void createToken()}
          className={cn(
            "bg-app-primary rounded-lg px-4 py-2 font-medium text-white",
            FOCUS_RING,
            "hover:bg-app-primary-hover cursor-pointer disabled:opacity-50"
          )}
        >
          Crear token
        </button>
      </div>

      <div>
        <h3 className="text-app-fg mb-2 text-sm font-semibold">Tokens existentes</h3>
        {loading ? (
          <p className="text-app-fg-muted text-sm">Cargando…</p>
        ) : tokens.length === 0 ? (
          <p className="text-app-fg-muted text-sm">Aún no hay tokens.</p>
        ) : (
          <ul className="space-y-2">
            {tokens.map((t) => (
              <li
                key={t.id}
                className="border-app-border-muted flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-app-fg truncate text-sm font-medium">
                    {t.name}{" "}
                    <span className="text-app-fg-muted font-normal">
                      ({t.prefix}…){t.revoked_at ? " · revocado" : ""}
                    </span>
                  </p>
                  <p className="text-app-fg-muted truncate text-xs">{t.scopes.join(", ")}</p>
                </div>
                {!t.revoked_at ? (
                  <button
                    type="button"
                    onClick={() => void revoke(t.id)}
                    className={cn(
                      "border-app-input-border text-app-fg-secondary rounded-lg border px-3 py-1 text-xs",
                      FOCUS_RING,
                      "hover:bg-app-raised-muted cursor-pointer"
                    )}
                  >
                    Revocar
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
