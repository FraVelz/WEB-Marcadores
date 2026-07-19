"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { toast } from "@pheralb/toast"

import { useFocusTrap } from "@/hooks/useFocusTrap"
import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"
import { useHotkeys } from "@/lib/hotkeys/useHotkeys"
import { McpCodeIcon } from "./icons/McpCodeIcon"

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

function mcpServerUrl(): string {
  if (typeof window === "undefined") {
    return "https://web-marcadores.vercel.app/api/mcp"
  }
  const published = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim()
  const origin = published || window.location.origin
  return `${origin}/api/mcp`
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
  const dialogRef = useRef<HTMLDivElement>(null)
  const agentButtonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [agent, setAgent] = useState<AgentId>("cursor")
  const [agentMenuOpen, setAgentMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const url = useMemo(() => (open ? mcpServerUrl() : ""), [open])
  const snippet = snippetForAgent(agent, url)
  const agentLabel = AGENTS.find((a) => a.id === agent)?.label ?? "Cursor"

  useFocusTrap(dialogRef, { enabled: open, initialFocusRef: agentButtonRef })
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
      ref={dialogRef}
      className="bg-app-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      data-no-vim
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-none bg-transparent p-0"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div className="border-app-border bg-app-raised relative z-10 w-full max-w-[22rem] rounded-xl border p-5 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <div className="bg-app-raised-muted text-app-primary border-app-border mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border">
              <McpCodeIcon className="size-4" />
            </div>
            <div className="min-w-0">
              <h2 id={titleId} className="text-app-fg text-[15px] font-semibold tracking-tight">
                Add MCP server
              </h2>
              <p className="text-app-fg-muted mt-1 text-[13px] leading-snug">
                Acceso a tus marcadores desde el agente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "text-app-fg-muted hover:bg-app-hover hover:text-app-fg shrink-0 rounded-lg p-1.5 transition-colors",
              FOCUS_RING
            )}
            aria-label="Cerrar diálogo"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="relative mt-5" ref={menuRef}>
          <button
            ref={agentButtonRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={agentMenuOpen}
            onClick={() => setAgentMenuOpen((v) => !v)}
            className={cn(
              "border-app-input-border bg-app-raised-muted text-app-fg flex w-full items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm",
              "hover:border-app-focus transition-colors",
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
              className="border-app-border bg-app-raised absolute z-20 mt-1.5 w-full overflow-hidden rounded-lg border py-1 shadow-xl"
            >
              {AGENTS.map((item) => (
                <li key={item.id} role="option" aria-selected={agent === item.id}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm",
                      agent === item.id
                        ? "bg-app-primary/15 text-app-fg"
                        : "text-app-fg-secondary hover:bg-app-hover hover:text-app-fg"
                    )}
                    onClick={() => {
                      setAgent(item.id)
                      setAgentMenuOpen(false)
                    }}
                  >
                    {item.label}
                    {agent === item.id ? (
                      <svg className="text-app-primary size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="border-app-border bg-app-raised-muted relative mt-3 overflow-hidden rounded-lg border">
          <button
            type="button"
            onClick={() => void copySnippet()}
            className={cn(
              "text-app-fg-muted hover:bg-app-hover hover:text-app-fg absolute top-2.5 right-2.5 z-10 rounded-lg p-1.5 transition-colors",
              FOCUS_RING
            )}
            title="Copiar"
            aria-label={copied ? "Copiado" : "Copiar"}
          >
            {copied ? (
              <svg className="text-app-primary size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
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
          <pre className="text-app-fg-secondary max-h-40 overflow-auto p-3.5 pr-11 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
            {snippet}
          </pre>
        </div>

        <p className="mt-3 text-center text-[12px]">
          <Link
            href="/perfil"
            className="text-app-primary hover:text-app-primary-hover underline-offset-2 hover:underline"
            onClick={onClose}
          >
            Obtener clave
          </Link>
        </p>
      </div>
    </div>
  )
}
