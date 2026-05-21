import {
  sanitizeHexColor,
  type AppAppearanceState,
  type AppCustomColors,
  type AppThemePreset,
} from "@/lib/appAppearance"

const CUSTOM_VAR_KEYS: Array<[keyof AppCustomColors, string]> = [
  ["canvas", "--app-canvas"],
  ["sidebar", "--app-sidebar"],
  ["toolbar", "--app-toolbar"],
  ["raised", "--app-raised"],
  ["fg", "--app-fg"],
  ["primary", "--app-primary"],
]

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function hexToRgbTriplet(hex: string): [number, number, number] | null {
  const canonical = sanitizeHexColor(hex)
  if (!canonical) return null
  const h = canonical.replace("#", "")
  const num = Number.parseInt(h, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

/** `null` = cabecera no disponible (tema «sistema» en SSR). */
export function readPrefersColorSchemeDark(headers: Headers): boolean | null {
  const ch = headers.get("sec-ch-prefers-color-scheme")?.toLowerCase()
  if (ch === "dark") return true
  if (ch === "light") return false
  return null
}

export function resolveDarkClassForServer(
  theme: AppThemePreset,
  prefersDark: boolean | null
): boolean {
  if (theme === "dark") return true
  if (theme === "light") return false
  return prefersDark ?? true
}

export function buildHtmlClassName(useDark: boolean): string | undefined {
  return useDark ? "dark" : undefined
}

/** Estilos inline en `<html>` para paleta, selección de texto y cristal de ventanas (SSR). */
export function buildAppearanceInlineStyle(
  state: Pick<AppAppearanceState, "useCustomPalette" | "customColors" | "textSelection" | "deskWindowTransparency">
): Record<string, string> {
  const style: Record<string, string> = {}

  const t = Number.isFinite(state.deskWindowTransparency) ? state.deskWindowTransparency : 0
  const clamped = Math.min(1, Math.max(0, t))
  style["--app-desk-window-solid-pct"] = `${100 - clamped * 62}%`

  const hex = sanitizeHexColor(state.textSelection ?? undefined)
  if (hex) {
    style["--app-text-selection-bg"] = `color-mix(in srgb, ${hex} 30%, transparent)`
    const tri = hexToRgbTriplet(hex)
    const L = tri ? relativeLuminance(tri[0], tri[1], tri[2]) : 0.5
    style["--app-text-selection-text"] = L > 0.55 ? "#0a0a0a" : "#fafafa"
  }

  if (state.useCustomPalette) {
    for (const [key, cssVar] of CUSTOM_VAR_KEYS) {
      const v = sanitizeHexColor(state.customColors[key])
      if (v) style[cssVar] = v
    }
    const p = sanitizeHexColor(state.customColors.primary)
    if (p) {
      style["--app-accent"] = p
      style["--app-link"] = p
      style["--app-focus"] = p
      style["--app-primary-hover"] = `color-mix(in srgb, ${p} 82%, black)`
    }
  }

  return style
}
