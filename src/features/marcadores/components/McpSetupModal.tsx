"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
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

const TOKEN_PLACEHOLDER = "wm_TU_CLAVE"

function publishedSiteOrigin(): string | null {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim()
  return site || null
}

function mcpUrlFromOrigin(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/mcp`
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
  const menuRef = useRef<HTMLDivElement>(null)
  const [agent, setAgent] = useState<AgentId>("cursor")
  const [agentMenuOpen, setAgentMenuOpen] = useState(false)
  const [copied, setCopied] = useState<"snippet" | "url" | null>(null)
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
  const showUrlToggle = Boolean(published && currentOrigin && published !== currentOrigin)

  useHotkeys("esc", () => onClose(), { enabled: open }, [onClose, open])

  useEffect(() => {
    if (!agentMenuOpen) return
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setAgentMenuOpen(false)
    }
    document.addEventListener("mousedown", onPointer)
    return () => document.removeEventListener("mousedown", onPointer)
  }, [agentMenuOpen])

  if (!open) return null

  const copy = async (kind: "snippet" | "url", text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      toast.success({ text: "Copiado" })
      window.setTimeout(() => setCopied(null), 1500)
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
          "border-app-border relative z-10 w-full max-w-[26rem] rounded-2xl border bg-zinc-950 shadow-2xl",
          "ring-1 ring-white/5"
        )}
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-1">
          <div className="min-w-0">
            <h2 id={titleId} className="text-base font-semibold tracking-tight text-zinc-50">
              Add MCP server
            </h2>
            <p className="mt-1.5 text-[13px] leading-snug text-zinc-400">
              Acceso a tus marcadores, carpetas y papelera.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "shrink-0 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200",
              FOCUS_RING
            )}
            aria-label="Cerrar"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 px-5 pt-3 pb-5">
          <div className="rounded-xl border border-white/10 bg-zinc-900/80 p-3">
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase">Server URL</span>
              <div className="flex items-center gap-2">
                {showUrlToggle ? (
                  <div className="flex rounded-md bg-zinc-950 p-0.5 ring-1 ring-white/10">
                    <button
                      type="button"
                      onClick={() => setUrlChoice("published")}
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                        urlChoice === "published" ? "bg-zinc-700 text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      Prod
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrlChoice("current")}
                      className={cn(
                        "rounded px-2 py-0.5 text-[10px] font-medium transition-colors",
                        urlChoice === "current" ? "bg-zinc-700 text-zinc-50" : "text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      Local
                    </button>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => void copy("url", url)}
                  className={cn("text-[11px] font-medium text-sky-400 hover:text-sky-300", FOCUS_RING)}
                >
                  {copied === "url" ? "OK" : "Copiar"}
                </button>
              </div>
            </div>
            <code className="block font-mono text-[12px] leading-relaxed break-all text-zinc-200">{url}</code>
            {isLocalhost ? (
              <p className="mt-1.5 text-[11px] text-zinc-500">
                Requiere <code className="text-zinc-400">pnpm dev</code>.
              </p>
            ) : null}
            <p className="mt-2 border-t border-white/5 pt-2 text-[11px] leading-relaxed text-zinc-500">
              Clave <code className="text-zinc-400">wm_…</code> en{" "}
              <Link href="/perfil" className="text-sky-400 hover:text-sky-300" onClick={onClose}>
                Perfil → Agent Access
              </Link>
              . En el snippet reemplaza <code className="text-zinc-400">{TOKEN_PLACEHOLDER}</code>.
            </p>
          </div>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={agentMenuOpen}
              onClick={() => setAgentMenuOpen((v) => !v)}
              className={cn(
                "flex w-full items-center justify-between rounded-xl border border-white/10 bg-zinc-900 px-3.5 py-2.5 text-left text-sm text-zinc-100",
                "hover:border-white/20",
                FOCUS_RING
              )}
            >
              <span>{agentLabel}</span>
              <svg className="size-4 text-zinc-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </button>
            {agentMenuOpen ? (
              <ul
                role="listbox"
                className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-xl border border-white/10 bg-zinc-900 py-1 shadow-xl"
              >
                {AGENTS.map((item) => (
                  <li key={item.id} role="option" aria-selected={agent === item.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm",
                        agent === item.id
                          ? "bg-white/10 text-zinc-50"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      )}
                      onClick={() => {
                        setAgent(item.id)
                        setAgentMenuOpen(false)
                      }}
                    >
                      {item.label}
                      {agent === item.id ? (
                        <svg className="size-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-zinc-900">
            <button
              type="button"
              onClick={() => void copy("snippet", snippet)}
              className={cn(
                "absolute top-2 right-2 z-10 rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200",
                FOCUS_RING
              )}
              title="Copiar"
              aria-label={copied === "snippet" ? "Copiado" : "Copiar configuración"}
            >
              {copied === "snippet" ? (
                <svg className="size-4 text-sky-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
            <pre className="max-h-44 overflow-auto p-3.5 pr-11 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-zinc-300">
              {snippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
