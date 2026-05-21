const HEX_RE = /^#?[0-9a-f]{6}$/i

const LIGHT_CANVAS = "#fafafa"
const DARK_CANVAS = "#09090b"
const LIGHT_ACCENT = "#2563eb"
const DARK_ACCENT = "#60a5fa"

/** Porcentaje del color de acento en el fondo de `::selection` (resto = canvas del tema). */
const SELECTION_ACCENT_MIX_PCT = 52

export type TextSelectionCssVars = {
  "--app-text-selection-bg": string
  "--app-text-selection-text": string
}

function sanitizeHexColor(value?: string): string | null {
  const s = value?.trim() ?? ""
  if (!s || s.length > 32) return null
  const withHash = s.startsWith("#") ? s : `#${s}`
  return HEX_RE.test(withHash) ? withHash.toLowerCase() : null
}

function hexToRgb(hex: string): [number, number, number] | null {
  const canonical = sanitizeHexColor(hex)
  if (!canonical) return null
  const h = canonical.replace("#", "")
  const n = Number.parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function relativeLuminance(r: number, g: number, b: number): number {
  const lin = (v: number) => {
    const x = v / 255
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrastRatio(bg: [number, number, number], fg: [number, number, number]): number {
  const L1 = relativeLuminance(bg[0], bg[1], bg[2])
  const L2 = relativeLuminance(fg[0], fg[1], fg[2])
  const lighter = Math.max(L1, L2)
  const darker = Math.min(L1, L2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** Mezcla lineal accent + canvas (equivalente aproximado de `color-mix`). */
function mixRgb(
  accent: [number, number, number],
  canvas: [number, number, number],
  accentWeight: number
): [number, number, number] {
  const w = Math.min(1, Math.max(0, accentWeight))
  return [
    Math.round(accent[0] * w + canvas[0] * (1 - w)),
    Math.round(accent[1] * w + canvas[1] * (1 - w)),
    Math.round(accent[2] * w + canvas[2] * (1 - w)),
  ]
}

function bestTextOnBackground(bg: [number, number, number]): "#fafafa" | "#0a0a0a" {
  const light: [number, number, number] = [255, 255, 255]
  const dark: [number, number, number] = [10, 10, 10]
  return contrastRatio(bg, light) >= contrastRatio(bg, dark) ? "#fafafa" : "#0a0a0a"
}

/** Variables CSS para `::selection` con contraste legible. */
export function textSelectionCssVars(
  accentHex: string | null | undefined,
  options?: { canvasHex?: string; isDark?: boolean }
): TextSelectionCssVars | null {
  const accent = sanitizeHexColor(accentHex ?? undefined)
  if (!accent) return null

  const canvasHex = sanitizeHexColor(options?.canvasHex) ?? (options?.isDark ? DARK_CANVAS : LIGHT_CANVAS)
  const accentRgb = hexToRgb(accent)
  const canvasRgb = hexToRgb(canvasHex)
  if (!accentRgb || !canvasRgb) return null

  const weight = SELECTION_ACCENT_MIX_PCT / 100
  const mixed = mixRgb(accentRgb, canvasRgb, weight)

  return {
    "--app-text-selection-bg": `color-mix(in srgb, ${accent} ${SELECTION_ACCENT_MIX_PCT}%, ${canvasHex})`,
    "--app-text-selection-text": bestTextOnBackground(mixed),
  }
}

/** Valores por defecto según tema (sin color personalizado en ajustes). */
export function defaultTextSelectionCssVars(isDark: boolean): TextSelectionCssVars {
  return (
    textSelectionCssVars(isDark ? DARK_ACCENT : LIGHT_ACCENT, { isDark }) ?? {
      "--app-text-selection-bg": `color-mix(in srgb, ${isDark ? DARK_ACCENT : LIGHT_ACCENT} ${SELECTION_ACCENT_MIX_PCT}%, ${isDark ? DARK_CANVAS : LIGHT_CANVAS})`,
      "--app-text-selection-text": isDark ? "#fafafa" : "#ffffff",
    }
  )
}
