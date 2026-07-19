"use client"

import { useId, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "@pheralb/toast"

import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"
import { useHotkeys } from "@/lib/hotkeys/useHotkeys"

type Props = {
  open: boolean
  onClose: () => void
}

type AgentId = "claude" | "cursor" | "codex"

const AGENTS: { id: AgentId; label: string }[] = [
  { id: "claude", label: "Claude Code" },
  { id: "cursor", label: "Cursor" },
  { id: "codex", label: "Codex" },
]

const TOKEN_PLACEHOLDER = "PEGA_AQUI_TU_CLAVE_wm"

function publishedSiteOrigin(): string | null {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim()
  return site || null
}

function mcpUrlFromOrigin(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/mcp/mcp`
}

function snippetForAgent(agent: AgentId, url: string): string {
  const auth = `Bearer ${TOKEN_PLACEHOLDER}`
  switch (agent) {
    case "claude":
      return `claude mcp add --transport http web-marcadores ${url} \\\n  --header "Authorization: ${auth}"`
    case "cursor":
      return `{
  "mcpServers": {
    "web-marcadores": {
      "url": "${url}",
      "headers": {
        "Authorization": "${auth}"
      }
    }
  }
}`
    case "codex":
      return `[mcp_servers.web-marcadores]
url = "${url}"
http_headers = { "Authorization" = "${auth}" }`
  }
}

export function McpSetupModal({ open, onClose }: Props) {
  const titleId = useId()
  const [agent, setAgent] = useState<AgentId>("cursor")
  const [agentMenuOpen, setAgentMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [urlChoice, setUrlChoice] = useState<"published" | "current">("published")

  const published = useMemo(() => publishedSiteOrigin(), [])
  const currentOrigin = useMemo(() => {
    if (!open || typeof window === "undefined") return ""
    return window.location.origin
  }, [open])

  const preferredOrigin =
    urlChoice === "published" && published
      ? published
      : currentOrigin || published || "https://web-marcadores.vercel.app"

  const url = mcpUrlFromOrigin(preferredOrigin)
  const snippet = snippetForAgent(agent, url)
  const agentLabel = AGENTS.find((a) => a.id === agent)?.label ?? "Cursor"
  const isLocalhost = /localhost|127\.0\.0\.1/.test(preferredOrigin)

  useHotkeys("esc", () => onClose(), { enabled: open }, [onClose, open])

  if (!open) return null

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet)
      setCopied(true)
      toast.success({ text: "Copiado" })
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error({ text: "No se pudo copiar" })
    }
  }

  return (
    <div
      className="bg-app-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-no-vim
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-none bg-transparent p-0"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative z-10 w-full max-w-md overflow-visible rounded-xl",
          "border-app-border bg-app-raised border p-6 shadow-xl"
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id={titleId} className="text-app-fg font-mono text-lg font-semibold tracking-tight">
              Add MCP server
            </h2>
            <p className="text-app-fg-secondary mt-2 text-sm leading-relaxed">
              Da a tu agente acceso a tus marcadores, carpetas y papelera de esta web.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn("text-app-fg-muted hover:text-app-fg -mt-1 -mr-1 rounded-md p-1.5", FOCUS_RING)}
            aria-label="Cerrar"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="border-app-border-muted mt-4 space-y-2 rounded-lg border p-3 text-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-app-fg-label text-xs font-medium uppercase">URL</span>
            {published && currentOrigin && published !== currentOrigin ? (
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setUrlChoice("published")}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium",
                    urlChoice === "published" ? "text-app-primary" : "text-app-fg-muted hover:text-app-fg"
                  )}
                >
                  Publicada
                </button>
                <button
                  type="button"
                  onClick={() => setUrlChoice("current")}
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-medium",
                    urlChoice === "current" ? "text-app-primary" : "text-app-fg-muted hover:text-app-fg"
                  )}
                >
                  Esta pestaña
                </button>
              </div>
            ) : null}
          </div>
          <code className="text-app-fg block text-xs break-all">{url}</code>
          {isLocalhost ? (
            <p className="text-app-fg-muted text-[11px]">Solo útil con el servidor local en marcha.</p>
          ) : null}
          <p className="text-app-fg-secondary text-xs leading-relaxed">
            Auth: Bearer con clave <code className="text-[11px]">wm_…</code> creada en{" "}
            <Link href="/perfil" className="text-app-primary underline" onClick={onClose}>
              Perfil → Agent Access
            </Link>
            . Sustituye <code className="text-[11px]">{TOKEN_PLACEHOLDER}</code> en el snippet.
          </p>
        </div>

        <div className="relative mt-4">
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={agentMenuOpen}
            onClick={() => setAgentMenuOpen((v) => !v)}
            className={cn(
              "border-app-input-border bg-app-raised-muted text-app-fg flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left text-sm",
              FOCUS_RING
            )}
          >
            <span>{agentLabel}</span>
            <svg className="text-app-fg-muted size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M7 10l5 5 5-5H7z" />
            </svg>
          </button>
          {agentMenuOpen ? (
            <ul
              role="listbox"
              className="border-app-border bg-app-raised absolute z-20 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
            >
              {AGENTS.map((item) => (
                <li key={item.id} role="option" aria-selected={agent === item.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2.5 text-left text-sm",
                      agent === item.id ? "bg-app-hover text-app-fg" : "text-app-fg-secondary hover:bg-app-hover"
                    )}
                    onClick={() => {
                      setAgent(item.id)
                      setAgentMenuOpen(false)
                    }}
                  >
                    {item.label}
                    {agent === item.id ? (
                      <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="border-app-border bg-app-raised-muted relative mt-3 rounded-lg border">
          <button
            type="button"
            onClick={() => void copySnippet()}
            className={cn("text-app-fg-muted hover:text-app-fg absolute top-2 right-2 rounded-md p-1.5", FOCUS_RING)}
            title="Copiar"
            aria-label={copied ? "Copiado" : "Copiar configuración"}
          >
            {copied ? (
              <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            ) : (
              <svg
                className="size-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                aria-hidden
              >
                <rect x="9" y="9" width="11" height="11" rx="1.5" />
                <path d="M5 15V5h10" strokeLinecap="round" />
              </svg>
            )}
          </button>
          <pre className="text-app-fg max-h-48 overflow-auto p-3 pr-10 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
            {snippet}
          </pre>
        </div>
      </div>
    </div>
  )
}
