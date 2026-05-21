import {
  sanitizeHexColor,
  type AppAppearanceState,
  type AppCustomColors,
  type AppThemePreset,
} from "@/lib/appAppearance"
import { defaultTextSelectionCssVars, textSelectionCssVars } from "@/lib/textSelectionStyle"

const CUSTOM_VAR_KEYS: Array<[keyof AppCustomColors, string]> = [
  ["canvas", "--app-canvas"],
  ["sidebar", "--app-sidebar"],
  ["toolbar", "--app-toolbar"],
  ["raised", "--app-raised"],
  ["fg", "--app-fg"],
  ["primary", "--app-primary"],
]

/** `null` = cabecera no disponible (tema «sistema» en SSR). */
export function readPrefersColorSchemeDark(headers: Headers): boolean | null {
  const ch = headers.get("sec-ch-prefers-color-scheme")?.toLowerCase()
  if (ch === "dark") return true
  if (ch === "light") return false
  return null
}

export function resolveDarkClassForServer(theme: AppThemePreset, prefersDark: boolean | null): boolean {
  if (theme === "dark") return true
  if (theme === "light") return false
  return prefersDark ?? true
}

export function buildHtmlClassName(useDark: boolean): string | undefined {
  return useDark ? "dark" : undefined
}

/** Estilos inline en `<html>` para paleta, selección de texto y cristal de ventanas (SSR). */
export function buildAppearanceInlineStyle(
  state: Pick<AppAppearanceState, "useCustomPalette" | "customColors" | "textSelection" | "deskWindowTransparency">,
  useDark: boolean
): Record<string, string> {
  const style: Record<string, string> = {}

  const t = Number.isFinite(state.deskWindowTransparency) ? state.deskWindowTransparency : 0
  const clamped = Math.min(1, Math.max(0, t))
  style["--app-desk-window-solid-pct"] = `${100 - clamped * 62}%`

  const canvasHex =
    state.useCustomPalette && state.customColors.canvas
      ? (sanitizeHexColor(state.customColors.canvas) ?? undefined)
      : undefined
  const selectionVars =
    textSelectionCssVars(state.textSelection, { canvasHex, isDark: useDark }) ?? defaultTextSelectionCssVars(useDark)
  Object.assign(style, selectionVars)

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
