/** Foco teclado estándar — outline, sin outline-none */
export const FOCUS_RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-focus"

/** Variante compacta para icon buttons (toolbar, rail) */
export const FOCUS_RING_ICON_BTN =
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-app-focus"

/** Listas dentro de scroll (outline inset, menos recorte que ring-offset externo) */
export const FOCUS_RING_INSET =
  "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-app-focus"

/** Ítem de lista/grid seleccionado por hjkl o clic */
export const KEYBOARD_SELECTED = "border-app-focus bg-app-selection ring-2 ring-app-focus"

/** Región scope de hotkeys (main, explorer rail) — foco perceptible al tabular */
export const HOTKEY_SCOPE_FOCUS =
  "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-app-focus/60"

/** Botones de barra de herramientas del escritorio (layout bar) */
export const DESKTOP_LAYOUT_TOOL_BTN_ROW =
  "inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium " + FOCUS_RING
