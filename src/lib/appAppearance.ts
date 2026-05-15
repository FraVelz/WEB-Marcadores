import { readTabScopedItem } from "@/lib/tabScopedStorage"

export const APP_APPEARANCE_STORAGE_KEY = "marcadores_app_appearance_v1"

export type AppThemePreset = "light" | "dark" | "system"

export type AppCustomColors = Partial<{
  canvas: string
  sidebar: string
  toolbar: string
  raised: string
  fg: string
  primary: string
}>

/** Valores válidos aplicados sobre `document.documentElement` */
const CUSTOM_VAR_KEYS: Array<[keyof AppCustomColors, string]> = [
  ["canvas", "--app-canvas"],
  ["sidebar", "--app-sidebar"],
  ["toolbar", "--app-toolbar"],
  ["raised", "--app-raised"],
  ["fg", "--app-fg"],
  ["primary", "--app-primary"],
]

export type AppAppearanceState = {
  theme: AppThemePreset
  useCustomPalette: boolean
  customColors: AppCustomColors
  /** data URL JPEG/PNG/WebP guardada localmente */
  wallpaperDataUrl: string | null
  /** Velo sobre la imagen: 0 = imagen muy visible, 1 = apenas se ve */
  wallpaperVeil: number
  /**
   * Transparencia tipo vidrio de las ventanas del escritorio (Marcadores).
   * 0 = opacas; 1 = máximo cristal (con piso de legibilidad).
   */
  deskWindowTransparency: number
  /**
   * Hex (#rrggbb) para el resaltado al seleccionar texto. `null` = usar el valor del tema.
   */
  textSelection: string | null
}

export const defaultAppAppearanceState: AppAppearanceState = {
  theme: "dark",
  useCustomPalette: false,
  customColors: {},
  wallpaperDataUrl: null,
  wallpaperVeil: 0.72,
  deskWindowTransparency: 0,
  textSelection: null,
}

const HEX_RE = /^#?[0-9a-f]{6}$/i

export function sanitizeHexColor(value?: string): string | null {
  const s = value?.trim() ?? ""
  if (!s || s.length > 32) return null
  const withHash = s.startsWith("#") ? s : `#${s}`
  return HEX_RE.test(withHash) ? withHash.toLowerCase() : null
}

function sanitizeAppAppearanceState(raw: unknown): AppAppearanceState {
  if (!raw || typeof raw !== "object") return { ...defaultAppAppearanceState }

  const o = raw as Record<string, unknown>
  const theme: AppThemePreset =
    o.theme === "light" || o.theme === "dark" || o.theme === "system" ? o.theme : defaultAppAppearanceState.theme

  const useCustomPalette = Boolean(o.useCustomPalette)

  let customColors: AppCustomColors = {}
  if (typeof o.customColors === "object" && o.customColors !== null && !Array.isArray(o.customColors)) {
    const c = o.customColors as Record<string, unknown>
    const keys: (keyof AppCustomColors)[] = ["canvas", "sidebar", "toolbar", "raised", "fg", "primary"]
    for (const key of keys) {
      const hc = typeof c[key] === "string" ? sanitizeHexColor(c[key] as string) : null
      if (hc) customColors = { ...customColors, [key]: hc }
    }
  }

  const wallpaperDataUrl =
    typeof o.wallpaperDataUrl === "string" &&
    o.wallpaperDataUrl.startsWith("data:image/") &&
    o.wallpaperDataUrl.length <= 3_500_000
      ? o.wallpaperDataUrl
      : null

  const veilRaw = typeof o.wallpaperVeil === "number" ? o.wallpaperVeil : defaultAppAppearanceState.wallpaperVeil
  const wallpaperVeil = Math.min(
    1,
    Math.max(0, Number.isFinite(veilRaw) ? veilRaw : defaultAppAppearanceState.wallpaperVeil)
  )

  const deskTRaw =
    typeof o.deskWindowTransparency === "number"
      ? o.deskWindowTransparency
      : defaultAppAppearanceState.deskWindowTransparency
  const deskWindowTransparency = Math.min(
    1,
    Math.max(0, Number.isFinite(deskTRaw) ? deskTRaw : defaultAppAppearanceState.deskWindowTransparency)
  )

  const textSelectionRaw = o.textSelection
  const textSelection =
    textSelectionRaw === null || textSelectionRaw === ""
      ? null
      : typeof textSelectionRaw === "string"
        ? sanitizeHexColor(textSelectionRaw)
        : null

  return {
    theme,
    useCustomPalette,
    customColors,
    wallpaperDataUrl,
    wallpaperVeil,
    deskWindowTransparency,
    textSelection,
  }
}

/**
 * Tema y tapiz deben ser los mismos en todas las pestañas: usamos una clave global.
 * Se migra una vez desde la clave con scope por pestaña (legacy).
 */
export function loadAppAppearanceFromStorage(): AppAppearanceState {
  if (typeof window === "undefined") return { ...defaultAppAppearanceState }
  try {
    let raw = localStorage.getItem(APP_APPEARANCE_STORAGE_KEY)
    if (!raw) {
      raw = readTabScopedItem(APP_APPEARANCE_STORAGE_KEY)
      if (raw) {
        try {
          localStorage.setItem(APP_APPEARANCE_STORAGE_KEY, raw)
        } catch {
          /* quota u otro — seguimos con raw en memoria */
        }
      }
    }
    if (!raw) return { ...defaultAppAppearanceState }
    return sanitizeAppAppearanceState(JSON.parse(raw) as unknown)
  } catch {
    return { ...defaultAppAppearanceState }
  }
}

export function saveAppAppearanceToStorage(state: AppAppearanceState): void {
  if (typeof window === "undefined") return
  try {
    const json = JSON.stringify(state)
    localStorage.setItem(APP_APPEARANCE_STORAGE_KEY, json)
  } catch {
    /* espacio localStorage insuficiente u otro — ignoramos */
  }
}

function getSystemDarkMode(): boolean {
  if (typeof window === "undefined") return true
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}

export function resolveDarkClass(theme: AppThemePreset): boolean {
  if (theme === "dark") return true
  if (theme === "light") return false
  return getSystemDarkMode()
}

/** Parte sólida del color de ventana (100% = opaco; bajar = más cristal). */
export function applyDeskWindowGlass(state: Pick<AppAppearanceState, "deskWindowTransparency">): void {
  if (typeof document === "undefined") return
  const t = Number.isFinite(state.deskWindowTransparency) ? state.deskWindowTransparency : 0
  const clamped = Math.min(1, Math.max(0, t))
  const solidPct = 100 - clamped * 62
  document.documentElement.style.setProperty("--app-desk-window-solid-pct", `${solidPct}%`)
}

/** Resaltado al seleccionar texto (`::selection`). No altera `--app-selection` (listas / chips). */
export function applyTextSelectionHighlight(state: Pick<AppAppearanceState, "textSelection">): void {
  if (typeof document === "undefined") return
  const root = document.documentElement
  const hex = sanitizeHexColor(state.textSelection ?? undefined)
  if (!hex) {
    root.style.removeProperty("--app-text-selection-bg")
    root.style.removeProperty("--app-text-selection-text")
    return
  }
  root.style.setProperty("--app-text-selection-bg", `color-mix(in srgb, ${hex} 30%, transparent)`)
  const tri = hexToRgbTriplet(hex)
  const L = tri ? relativeLuminance(tri[0], tri[1], tri[2]) : 0.5
  root.style.setProperty("--app-text-selection-text", L > 0.55 ? "#0a0a0a" : "#fafafa")
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Aplica sólo variables personalizadas (deja el resto al CSS del preset claro/oscuro). */
export function applyCustomColorVars(colors: AppCustomColors, enabled: boolean): void {
  if (typeof document === "undefined") return

  const root = document.documentElement

  root.style.removeProperty("--app-accent")
  root.style.removeProperty("--app-link")
  root.style.removeProperty("--app-focus")
  root.style.removeProperty("--app-primary-hover")

  for (const [, cssVar] of CUSTOM_VAR_KEYS) {
    root.style.removeProperty(cssVar)
  }

  if (!enabled) return

  for (const [key, cssVar] of CUSTOM_VAR_KEYS) {
    const v = sanitizeHexColor(colors[key])
    if (v) root.style.setProperty(cssVar, v)
  }

  const p = sanitizeHexColor(colors.primary)
  if (p) {
    root.style.setProperty("--app-accent", p)
    root.style.setProperty("--app-link", p)
    root.style.setProperty("--app-focus", p)
    root.style.setProperty("--app-primary-hover", `color-mix(in srgb, ${p} 82%, black)`)
  }
}

function hexToRgbTriplet(hex: string): [number, number, number] | null {
  const canonical = sanitizeHexColor(hex)
  if (!canonical) return null
  const h = canonical.replace("#", "")
  const num = Number.parseInt(h, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function resolveCanvasRgbForWallpaperOverlay(): [number, number, number] | null {
  if (typeof document === "undefined") return null
  const raw = getComputedStyle(document.documentElement).getPropertyValue("--app-canvas").trim()
  const tri = hexToRgbTriplet(raw)
  return tri ?? null
}

function buildWallpaperLayerStyle(
  state: Pick<AppAppearanceState, "wallpaperDataUrl" | "wallpaperVeil">
): {
  backgroundColor: string
  backgroundImage: string
  backgroundSize: string
  backgroundAttachment: string
  backgroundRepeat: string
} | null {
  if (!state.wallpaperDataUrl) return null

  const veil = Number.isFinite(state.wallpaperVeil) ? state.wallpaperVeil : defaultAppAppearanceState.wallpaperVeil
  const canvasRgb = resolveCanvasRgbForWallpaperOverlay()
  const a = Math.min(0.98, Math.max(0, veil))
  const [r, g, b] = canvasRgb ?? [24, 24, 27]
  return {
    backgroundColor: "transparent",
    backgroundImage: `linear-gradient(rgba(${r},${g},${b},${a}),rgba(${r},${g},${b},${a})),url(${state.wallpaperDataUrl})`,
    backgroundSize: "cover,cover",
    backgroundAttachment: "fixed",
    backgroundRepeat: "no-repeat",
  }
}

/**
 * Misma capa que el `body` para nodos promovidos con Fullscreen API: el tapiz del body no llega al stack
 * detrás del elemento en pantalla completa (p. ej. host de explorador + escritorio en /marcadores).
 */
export function applyWallpaperToHTMLElement(
  el: HTMLElement | null,
  state: Pick<AppAppearanceState, "wallpaperDataUrl" | "wallpaperVeil">
): void {
  if (!el) return
  const layer = buildWallpaperLayerStyle(state)
  if (!layer) {
    el.style.removeProperty("background-color")
    el.style.removeProperty("background-image")
    el.style.removeProperty("background-size")
    el.style.removeProperty("background-attachment")
    el.style.removeProperty("background-repeat")
    return
  }
  el.style.backgroundColor = layer.backgroundColor
  el.style.backgroundImage = layer.backgroundImage
  el.style.backgroundSize = layer.backgroundSize
  el.style.backgroundAttachment = layer.backgroundAttachment
  el.style.backgroundRepeat = layer.backgroundRepeat
}

function clearWallpaperInlineFromBody(): void {
  if (typeof document === "undefined") return
  const el = document.body
  el.style.removeProperty("background-color")
  el.style.removeProperty("background-image")
  el.style.removeProperty("background-size")
  el.style.removeProperty("background-attachment")
  el.style.removeProperty("background-repeat")
}

/** Aplica tapiz al `body` (capa + velo según tema). Sin tapiz, solo quita estilos inline de fondo. */
export function applyWallpaperToBody(state: Pick<AppAppearanceState, "wallpaperDataUrl" | "wallpaperVeil">): void {
  if (typeof document === "undefined") return
  const el = document.body
  const layer = buildWallpaperLayerStyle(state)
  if (!layer) {
    clearWallpaperInlineFromBody()
    return
  }
  el.style.backgroundColor = layer.backgroundColor
  el.style.backgroundImage = layer.backgroundImage
  el.style.backgroundSize = layer.backgroundSize
  el.style.backgroundAttachment = layer.backgroundAttachment
  el.style.backgroundRepeat = layer.backgroundRepeat
}

const MAX_IMG_BYTES = 2_500_000
const MAX_DIMENSION = 1920

/** Redimensiona y comprime antes de meter en localStorage. */
export function fileToWallpaperDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/") || file.size > MAX_IMG_BYTES * 4) {
      resolve(null)
      return
    }
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const w = img.naturalWidth
        const h = img.naturalHeight
        if (!w || !h) {
          resolve(null)
          return
        }
        const scale = Math.min(1, MAX_DIMENSION / Math.max(w, h))
        const cw = Math.round(w * scale)
        const ch = Math.round(h * scale)

        const canvas = document.createElement("canvas")
        canvas.width = cw
        canvas.height = ch
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0, cw, ch)
        const jpeg = canvas.toDataURL("image/jpeg", 0.82)
        URL.revokeObjectURL(url)
        if (jpeg.length > MAX_IMG_BYTES) {
          const jpegSmall = canvas.toDataURL("image/jpeg", 0.62)
          resolve(jpegSmall.length > MAX_IMG_BYTES ? null : jpegSmall)
          return
        }
        resolve(jpeg)
      } catch {
        URL.revokeObjectURL(url)
        resolve(null)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}
