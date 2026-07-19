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

function mcpEndpointUrl(): string {
  if (typeof window === "undefined") return "https://TU_HOST/api/mcp/mcp"
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
  const origin = site || window.location.origin
  return `${origin}/api/mcp/mcp`
}

function cursorConfigSnippet(url: string): string {
  return `{
  "mcpServers": {
    "web-marcadores": {
      "url": "${url}",
      "headers": {
        "Authorization": "Bearer wm_TU_TOKEN"
      }
    }
  }
}`
}

export function McpSetupModal({ open, onClose }: Props) {
  const titleId = useId()
  const [copied, setCopied] = useState<"url" | "json" | null>(null)
  const url = useMemo(() => (open ? mcpEndpointUrl() : ""), [open])
  const snippet = useMemo(() => cursorConfigSnippet(url || "https://TU_HOST/api/mcp/mcp"), [url])

  useHotkeys("esc", () => onClose(), { enabled: open }, [onClose, open])

  if (!open) return null

  const copy = async (kind: "url" | "json", text: string) => {
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
          "relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl",
          "border-app-border bg-app-raised border p-6 shadow-xl"
        )}
      >
        <h2 id={titleId} className="text-app-fg text-xl font-semibold">
          Configurar MCP (Cursor)
        </h2>
        <p className="text-app-fg-secondary mt-2 text-sm leading-relaxed">
          Conecta Cursor u otro cliente MCP a tu biblioteca remota con un token personal.
        </p>

        <ol className="text-app-fg-secondary mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
          <li>
            Crea un PAT en{" "}
            <Link href="/perfil" className="text-app-primary underline" onClick={onClose}>
              Perfil → Agent Access
            </Link>{" "}
            (scopes según lo que necesites; p. ej. <code className="text-xs">bookmarks:read</code>).
          </li>
          <li>
            Copia el secret <code className="text-xs">wm_…</code> (solo se muestra una vez).
          </li>
          <li>Añade el servidor en la config MCP de Cursor con la URL y el Bearer.</li>
        </ol>

        <div className="mt-5 space-y-3">
          <div>
            <p className="text-app-fg-label mb-1 text-xs font-medium uppercase">Endpoint</p>
            <div className="border-app-border bg-app-raised-muted flex items-start gap-2 rounded-lg border p-3">
              <code className="text-app-fg min-w-0 flex-1 text-xs break-all">{url}</code>
              <button
                type="button"
                onClick={() => void copy("url", url)}
                className={cn("text-app-primary shrink-0 text-xs underline", FOCUS_RING)}
              >
                {copied === "url" ? "Listo" : "Copiar"}
              </button>
            </div>
          </div>

          <div>
            <p className="text-app-fg-label mb-1 text-xs font-medium uppercase">Ejemplo Cursor</p>
            <div className="border-app-border bg-app-raised-muted relative rounded-lg border p-3">
              <button
                type="button"
                onClick={() => void copy("json", snippet)}
                className={cn("text-app-primary absolute top-2 right-2 text-xs underline", FOCUS_RING)}
              >
                {copied === "json" ? "Listo" : "Copiar"}
              </button>
              <pre className="text-app-fg overflow-x-auto pr-14 text-[11px] leading-relaxed whitespace-pre-wrap">
                {snippet}
              </pre>
            </div>
          </div>
        </div>

        <p className="text-app-fg-muted mt-4 text-xs">
          No disponible en modo demo. El service role debe estar configurado en el servidor.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "border-app-input-border text-app-fg-secondary rounded-lg border px-4 py-2 text-sm",
              FOCUS_RING,
              "hover:bg-app-raised-muted cursor-pointer"
            )}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
