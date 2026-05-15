"use client"

import { useState, useSyncExternalStore } from "react"

import { useAppAppearance } from "@/contexts/AppAppearanceContext"
import {
  fileToWallpaperDataUrl,
  sanitizeHexColor,
  type AppCustomColors,
  type AppThemePreset,
} from "@/lib/appAppearance"

import { cn } from "@/lib/utils"

const THEME_LABELS: Record<AppThemePreset, string> = {
  light: "Claro",
  dark: "Oscuro",
  system: "Según el sistema",
}

const COLOR_ROWS: Array<{ key: keyof AppCustomColors; label: string }> = [
  { key: "canvas", label: "Fondo principal" },
  { key: "sidebar", label: "Paneles (explorador / barras)" },
  { key: "toolbar", label: "Barras secundarias" },
  { key: "raised", label: "Superficie de tarjetas" },
  { key: "fg", label: "Texto principal" },
  { key: "primary", label: "Acción principal y enlaces" },
]

/** Para mostrar valores en `<input type="color" />` cuando aún no hay override */
const PRESET_FALLBACK_HEX: Record<"light" | "dark", Record<keyof AppCustomColors, string>> = {
  light: {
    canvas: "#fafafa",
    sidebar: "#f4f4f5",
    toolbar: "#e4e4e7",
    raised: "#ffffff",
    fg: "#18181b",
    primary: "#2563eb",
  },
  dark: {
    canvas: "#09090b",
    sidebar: "#18181b",
    toolbar: "#18181b",
    raised: "#18181b",
    fg: "#fafafa",
    primary: "#2563eb",
  },
}

function subscribePrefersDark(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  mq.addEventListener("change", callback)
  return () => mq.removeEventListener("change", callback)
}

function getPrefersDarkSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

function getPrefersDarkServerSnapshot() {
  return false
}

function usePrefersSystemDarkLive() {
  return useSyncExternalStore(subscribePrefersDark, getPrefersDarkSnapshot, getPrefersDarkServerSnapshot)
}

function resolvePaletteKey(theme: AppThemePreset, systemDark: boolean): "light" | "dark" {
  if (theme === "light") return "light"
  if (theme === "dark") return "dark"
  return systemDark ? "dark" : "light"
}

export function AppearanceSettings() {
  const {
    appearance,
    setTheme,
    setUseCustomPalette,
    setCustomColor,
    resetCustomColors,
    setWallpaper,
    setWallpaperVeil,
    resetAllAppearance,
  } = useAppAppearance()

  const systemDark = usePrefersSystemDarkLive()
  const paletteKey = resolvePaletteKey(appearance.theme, systemDark)
  const fallbacks = PRESET_FALLBACK_HEX[paletteKey]

  const [wallpaperMessage, setWallpaperMessage] = useState<string | null>(null)

  const onPickWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWallpaperMessage(null)
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    void (async () => {
      const data = await fileToWallpaperDataUrl(file)
      if (!data) {
        setWallpaperMessage("No se pudo procesar la imagen (tamaño o formato). Prueba otra más pequeña.")
        return
      }
      if (data.length > 3_400_000) {
        setWallpaperMessage("La imagen sigue siendo demasiado grande para guardar en este navegador.")
        return
      }
      setWallpaper(data)
    })()
  }

  return (
    <div className="border-app-border-muted bg-app-raised rounded-lg border p-6">
      <h2 className="text-app-fg mb-1 text-lg font-semibold">Apariencia</h2>
      <p className="text-app-fg-secondary mb-6 text-sm">
        Tema, colores y fondo se guardan en el navegador (localmente, por pestaña); cada pestaña puede lucir distinto.
      </p>

      <div className="space-y-6">
        <div>
          <p className="text-app-fg-label mb-2 text-xs font-medium tracking-wide uppercase">Tema base</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(THEME_LABELS) as AppThemePreset[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTheme(t)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  appearance.theme === t
                    ? "border-app-accent bg-app-selection text-app-fg ring-app-focus ring-1"
                    : "border-app-input-border text-app-fg-secondary hover:bg-app-hover"
                )}
              >
                {THEME_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="border-app-border-muted border-t pt-5">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="border-app-input-border bg-app-raised-muted accent-app-primary mt-0.5 size-4 rounded"
              checked={appearance.useCustomPalette}
              onChange={(e) => setUseCustomPalette(e.target.checked)}
            />
            <span>
              <span className="text-app-fg block text-sm font-medium">Personalizar colores</span>
              <span className="text-app-fg-secondary mt-0.5 block text-xs">
                Sustituye sólo los tonos que elijas; el resto sigue el tema claro/oscuro.
              </span>
            </span>
          </label>

          {appearance.useCustomPalette && (
            <div className="mt-4 space-y-3 pl-1">
              {COLOR_ROWS.map(({ key, label }) => {
                const stored = appearance.customColors[key]
                const valid = stored ? sanitizeHexColor(stored) : null
                const display = valid ?? fallbacks[key]

                return (
                  <div key={key} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-app-fg-secondary w-full min-w-[10rem] text-sm sm:w-48">{label}</span>
                    <div className="flex flex-1 items-center gap-2">
                      <input
                        type="color"
                        aria-label={label}
                        className="border-app-input-border h-9 w-12 cursor-pointer rounded border bg-transparent p-0.5"
                        value={display}
                        onChange={(e) => setCustomColor(key, e.target.value)}
                      />
                      <input
                        type="text"
                        spellCheck={false}
                        value={stored ?? ""}
                        placeholder={display}
                        onChange={(e) => setCustomColor(key, e.target.value)}
                        className={cn(
                          "border-app-input-border bg-app-raised-muted text-app-fg min-w-0 flex-1 rounded border px-2 py-1.5 font-mono text-xs",
                          "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
                        )}
                      />
                    </div>
                  </div>
                )
              })}
              <button
                type="button"
                className="text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded-lg px-2 py-1.5 text-xs"
                onClick={() => resetCustomColors()}
              >
                Restaurar valores por defecto del tema para colores
              </button>
            </div>
          )}
        </div>

        <div className="border-app-border-muted border-t pt-5">
          <p className="text-app-fg-label mb-2 text-xs font-medium tracking-wide uppercase">Imagen de fondo</p>
          <p className="text-app-fg-secondary mb-3 text-xs">
            Se muestra detrás del velo del color «Fondo principal». Se procesa en el navegador y no se envía al
            servidor.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <label className="border-app-input-border hover:bg-app-hover inline-flex cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-colors">
              <input type="file" accept="image/*" className="sr-only" onChange={onPickWallpaper} />
              Elegir imagen
            </label>
            {appearance.wallpaperDataUrl ? (
              <button
                type="button"
                className="text-app-danger-fg hover:bg-app-danger-surface rounded-lg px-3 py-2 text-sm font-medium"
                onClick={() => {
                  setWallpaperMessage(null)
                  setWallpaper(null)
                }}
              >
                Quitar imagen
              </button>
            ) : null}
          </div>
          {appearance.wallpaperDataUrl ? (
            <div className="border-app-input-border mt-4 overflow-hidden rounded-lg border">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL usuario */}
              <img
                alt="Vista previa del fondo"
                src={appearance.wallpaperDataUrl}
                className="max-h-32 w-full object-cover"
              />
            </div>
          ) : null}
          <label className="text-app-fg-secondary mt-4 block text-sm">
            Velo sobre la imagen: {Math.round(appearance.wallpaperVeil * 100)}%
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(appearance.wallpaperVeil * 100)}
              onChange={(e) => setWallpaperVeil(Number(e.target.value) / 100)}
              className="accent-app-primary mt-2 block w-full max-w-sm"
            />
          </label>
          {wallpaperMessage ? <p className="text-app-danger-fg mt-2 text-sm">{wallpaperMessage}</p> : null}
        </div>

        <div className="border-app-border-muted flex flex-wrap gap-2 border-t pt-5">
          <button
            type="button"
            className="border-app-input-border text-app-fg-secondary hover:bg-app-hover rounded-lg border px-4 py-2 text-sm"
            onClick={() => void resetAllAppearance()}
          >
            Restablecer toda la apariencia
          </button>
        </div>
      </div>
    </div>
  )
}
