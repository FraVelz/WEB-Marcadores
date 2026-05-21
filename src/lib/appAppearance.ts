import {
  APP_APPEARANCE_STORAGE_KEY,
  APP_APPEARANCE_WALLPAPER_STORAGE_KEY,
  parseAppearanceCookieJson,
  readAppearanceCookieValueClient,
  readAppearanceCookieValueFromStore,
  writeAppearanceCookieClient,
} from "@/lib/appAppearanceCookies"
import { readTabScopedItem } from "@/lib/tabScopedStorage"
import { defaultTextSelectionCssVars, textSelectionCssVars } from "@/lib/textSelectionStyle"

type AppearanceCookiePayload = Omit<AppAppearanceState, "wallpaperDataUrl">

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

function appearanceToCookiePayload(state: AppAppearanceState): AppearanceCookiePayload {
  const { theme, useCustomPalette, customColors, wallpaperVeil, deskWindowTransparency, textSelection } = state
  return { theme, useCustomPalette, customColors, wallpaperVeil, deskWindowTransparency, textSelection }
}

function loadWallpaperFromStorage(): Pick<AppAppearanceState, "wallpaperDataUrl" | "wallpaperVeil"> {
  if (typeof window === "undefined") {
    return {
      wallpaperDataUrl: defaultAppAppearanceState.wallpaperDataUrl,
      wallpaperVeil: defaultAppAppearanceState.wallpaperVeil,
    }
  }
  try {
    const raw = localStorage.getItem(APP_APPEARANCE_WALLPAPER_STORAGE_KEY)
    if (!raw) {
      return {
        wallpaperDataUrl: defaultAppAppearanceState.wallpaperDataUrl,
        wallpaperVeil: defaultAppAppearanceState.wallpaperVeil,
      }
    }
    const parsed = JSON.parse(raw) as unknown
    const base = sanitizeAppAppearanceState(parsed)
    return {
      wallpaperDataUrl: base.wallpaperDataUrl,
      wallpaperVeil: base.wallpaperVeil,
    }
  } catch {
    return {
      wallpaperDataUrl: defaultAppAppearanceState.wallpaperDataUrl,
      wallpaperVeil: defaultAppAppearanceState.wallpaperVeil,
    }
  }
}

function saveWallpaperToStorage(state: AppAppearanceState): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      APP_APPEARANCE_WALLPAPER_STORAGE_KEY,
      JSON.stringify({
        wallpaperDataUrl: state.wallpaperDataUrl,
        wallpaperVeil: state.wallpaperVeil,
      })
    )
  } catch {
    /* quota */
  }
}

function loadAppearanceCookiePart(): AppearanceCookiePayload {
  const raw = readAppearanceCookieValueClient()
  const parsed = parseAppearanceCookieJson(raw)
  if (!parsed) return appearanceToCookiePayload(defaultAppAppearanceState)
  return appearanceToCookiePayload(sanitizeAppAppearanceState(parsed))
}

/** Servidor: lee apariencia desde `cookies()` (sin tapiz). */
export function loadAppAppearanceFromCookies(cookieStore: {
  get(name: string): { value: string } | undefined
}): AppAppearanceState {
  const raw = readAppearanceCookieValueFromStore(cookieStore)
  const parsed = parseAppearanceCookieJson(raw)
  if (!parsed) return { ...defaultAppAppearanceState }
  return sanitizeAppAppearanceState(parsed)
}

/**
 * Cliente: cookie (tema y paleta) + localStorage (tapiz).
 * Migra una vez desde localStorage legacy si no hay cookie.
 */
export function loadAppAppearanceFromStorage(): AppAppearanceState {
  if (typeof window === "undefined") return { ...defaultAppAppearanceState }

  migrateLegacyAppearanceToCookies()

  const cookiePart = loadAppearanceCookiePart()
  const wallpaperPart = loadWallpaperFromStorage()
  return { ...cookiePart, ...wallpaperPart }
}

export function saveAppAppearanceToStorage(state: AppAppearanceState): void {
  if (typeof window === "undefined") return
  writeAppearanceCookieClient(appearanceToCookiePayload(state))
  saveWallpaperToStorage(state)
}

/** Migra `localStorage` (y clave por pestaña) a cookie + tapiz separado. */
function migrateLegacyAppearanceToCookies(): void {
  if (typeof window === "undefined") return
  if (readAppearanceCookieValueClient()) return

  try {
    let raw = localStorage.getItem(APP_APPEARANCE_STORAGE_KEY)
    if (!raw) raw = readTabScopedItem(APP_APPEARANCE_STORAGE_KEY)
    if (!raw) return

    const legacy = sanitizeAppAppearanceState(JSON.parse(raw) as unknown)
    writeAppearanceCookieClient(appearanceToCookiePayload(legacy))
    saveWallpaperToStorage(legacy)
    try {
      localStorage.removeItem(APP_APPEARANCE_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  } catch {
    /* ignore */
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
export function applyTextSelectionHighlight(
  state: Pick<AppAppearanceState, "textSelection" | "useCustomPalette" | "customColors">
): void {
  if (typeof document === "undefined") return
  const root = document.documentElement
  const isDark = root.classList.contains("dark")
  const canvasRaw = getComputedStyle(root).getPropertyValue("--app-canvas").trim()
  const canvasHex = sanitizeHexColor(canvasRaw) ?? undefined
  const vars = textSelectionCssVars(state.textSelection, { canvasHex, isDark }) ?? defaultTextSelectionCssVars(isDark)
  root.style.setProperty("--app-text-selection-bg", vars["--app-text-selection-bg"])
  root.style.setProperty("--app-text-selection-text", vars["--app-text-selection-text"])
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

function buildWallpaperLayerStyle(state: Pick<AppAppearanceState, "wallpaperDataUrl" | "wallpaperVeil">): {
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
    el.style.cssText = ""
    return
  }
  el.style.cssText = [
    `background-color: ${layer.backgroundColor}`,
    `background-image: ${layer.backgroundImage}`,
    `background-size: ${layer.backgroundSize}`,
    `background-attachment: ${layer.backgroundAttachment}`,
    `background-repeat: ${layer.backgroundRepeat}`,
  ].join(";")
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
  el.style.cssText = [
    `background-color: ${layer.backgroundColor}`,
    `background-image: ${layer.backgroundImage}`,
    `background-size: ${layer.backgroundSize}`,
    `background-attachment: ${layer.backgroundAttachment}`,
    `background-repeat: ${layer.backgroundRepeat}`,
  ].join(";")
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
