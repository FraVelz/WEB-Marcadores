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

function publishedSiteOrigin(): string | null {
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim()
  return site || null
}

function mcpUrlFromOrigin(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/mcp/mcp`
}

function cursorConfigSnippet(url: string): string {
  return `{
  "mcpServers": {
    "web-marcadores": {
      "url": "${url}",
      "headers": {
        "Authorization": "Bearer PEGA_AQUI_TU_CLAVE"
      }
    }
  }
}`
}

export function McpSetupModal({ open, onClose }: Props) {
  const titleId = useId()
  const [copied, setCopied] = useState<"url" | "json" | null>(null)
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
  const snippet = cursorConfigSnippet(url)
  const isLocalhost = /localhost|127\.0\.0\.1/.test(preferredOrigin)

  useHotkeys("esc", () => onClose(), { enabled: open }, [onClose, open])

  if (!open) return null

  const copy = async (kind: "url" | "json", text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      toast.success({ text: "Copiado al portapapeles" })
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
          "relative z-10 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl",
          "border-app-border bg-app-raised border p-6 shadow-xl"
        )}
      >
        <h2 id={titleId} className="text-app-fg text-xl font-semibold">
          Usar Marcadores desde Cursor
        </h2>
        <p className="text-app-fg-secondary mt-2 text-sm leading-relaxed">
          Esto permite que el chat de <strong className="text-app-fg font-medium">Cursor</strong> busque, organice o
          edite <em>tus</em> marcadores (con tu permiso). No hace falta instalar nada extra en esta web: solo crear una
          clave aquí y pegarla en Cursor.
        </p>

        <div className="mt-5 space-y-5">
          <section className="border-app-border-muted rounded-lg border p-4">
            <h3 className="text-app-fg text-sm font-semibold">1. Crea una clave de acceso en esta web</h3>
            <ol className="text-app-fg-secondary mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              <li>
                Abre{" "}
                <Link href="/perfil" className="text-app-primary font-medium underline" onClick={onClose}>
                  Perfil
                </Link>{" "}
                (icono de usuario en la barra izquierda).
              </li>
              <li>
                Busca la sección <strong className="text-app-fg font-medium">Agent Access</strong>.
              </li>
              <li>
                Pon un nombre (ej. <em>Cursor</em>), deja marcados al menos{" "}
                <strong className="text-app-fg font-medium">leer marcadores</strong> y pulsa{" "}
                <strong className="text-app-fg font-medium">Crear token</strong>.
              </li>
              <li>
                Aparecerá una clave larga que empieza por <code className="text-xs">wm_</code>.{" "}
                <strong className="text-app-fg font-medium">Cópiala ya</strong>: solo se muestra una vez. Si la pierdes,
                crea otra.
              </li>
            </ol>
            <Link
              href="/perfil"
              onClick={onClose}
              className={cn(
                "bg-app-primary mt-3 inline-flex rounded-lg px-3 py-2 text-sm font-medium text-white",
                FOCUS_RING,
                "hover:bg-app-primary-hover"
              )}
            >
              Ir a Perfil a crear la clave
            </Link>
          </section>

          <section className="border-app-border-muted rounded-lg border p-4">
            <h3 className="text-app-fg text-sm font-semibold">2. Elige la dirección del servidor</h3>
            <p className="text-app-fg-secondary mt-1 text-sm leading-relaxed">
              Cursor se conecta a una URL de esta app. Para el día a día usa la{" "}
              <strong className="text-app-fg font-medium">web publicada</strong>, no localhost.
            </p>

            {published && currentOrigin && published !== currentOrigin ? (
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Elegir URL">
                <button
                  type="button"
                  onClick={() => setUrlChoice("published")}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium",
                    FOCUS_RING,
                    urlChoice === "published"
                      ? "border-app-primary bg-app-primary/15 text-app-fg"
                      : "border-app-input-border text-app-fg-secondary hover:bg-app-raised-muted"
                  )}
                >
                  Web publicada (recomendada)
                </button>
                <button
                  type="button"
                  onClick={() => setUrlChoice("current")}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium",
                    FOCUS_RING,
                    urlChoice === "current"
                      ? "border-app-primary bg-app-primary/15 text-app-fg"
                      : "border-app-input-border text-app-fg-secondary hover:bg-app-raised-muted"
                  )}
                >
                  Esta pestaña ({isLocalhost || /localhost|127\.0\.0\.1/.test(currentOrigin) ? "local" : "actual"})
                </button>
              </div>
            ) : null}

            <div className="border-app-border bg-app-raised-muted mt-3 flex items-start gap-2 rounded-lg border p-3">
              <code className="text-app-fg min-w-0 flex-1 text-xs break-all">{url}</code>
              <button
                type="button"
                onClick={() => void copy("url", url)}
                className={cn("text-app-primary shrink-0 text-xs font-medium underline", FOCUS_RING)}
              >
                {copied === "url" ? "Copiado" : "Copiar URL"}
              </button>
            </div>
            {isLocalhost ? (
              <p className="text-app-fg-muted mt-2 text-xs leading-relaxed">
                Estás en local: Cursor solo podrá conectar si tienes <code className="text-xs">pnpm dev</code> en marcha
                en este PC. En producción usa la web publicada.
              </p>
            ) : null}
          </section>

          <section className="border-app-border-muted rounded-lg border p-4">
            <h3 className="text-app-fg text-sm font-semibold">3. Pégalo en Cursor</h3>
            <ol className="text-app-fg-secondary mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
              <li>
                En Cursor abre <strong className="text-app-fg font-medium">Settings</strong> (engranaje) →{" "}
                <strong className="text-app-fg font-medium">MCP</strong> (o “Tools &amp; MCP”).
              </li>
              <li>
                Pulsa <strong className="text-app-fg font-medium">Add new MCP server</strong> / edita el JSON de
                servidores MCP.
              </li>
              <li>
                Pega el bloque de abajo y <strong className="text-app-fg font-medium">sustituye</strong>{" "}
                <code className="text-xs">PEGA_AQUI_TU_CLAVE</code> por la clave <code className="text-xs">wm_…</code>{" "}
                que copiaste (sin comillas extra; deja la palabra <code className="text-xs">Bearer</code>).
              </li>
              <li>Guarda y reinicia o recarga el servidor MCP si Cursor lo pide. Debería aparecer “web-marcadores”.</li>
            </ol>

            <div className="border-app-border bg-app-raised-muted relative mt-3 rounded-lg border p-3">
              <button
                type="button"
                onClick={() => void copy("json", snippet)}
                className={cn("text-app-primary absolute top-2 right-2 text-xs font-medium underline", FOCUS_RING)}
              >
                {copied === "json" ? "Copiado" : "Copiar JSON"}
              </button>
              <pre className="text-app-fg overflow-x-auto pr-16 text-[11px] leading-relaxed whitespace-pre-wrap">
                {snippet}
              </pre>
            </div>
          </section>

          <section className="border-app-border-muted bg-app-raised-muted/50 rounded-lg border p-4">
            <h3 className="text-app-fg text-sm font-semibold">¿Qué puede hacer Cursor?</h3>
            <ul className="text-app-fg-secondary mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
              <li>Buscar y listar tus marcadores y carpetas.</li>
              <li>Crear o editar enlaces (si activaste permisos de escritura al crear la clave).</li>
              <li>Ver la papelera y restaurar (si diste permiso de papelera).</li>
            </ul>
            <p className="text-app-fg-muted mt-2 text-xs leading-relaxed">
              Si estás en <strong>modo demo</strong> (sin cuenta), no puedes crear claves: inicia sesión primero.
            </p>
          </section>
        </div>

        <div className="mt-5 flex justify-end gap-2">
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
