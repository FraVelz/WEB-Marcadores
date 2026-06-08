/** Primer z-index asignado a ventanas del escritorio al enfocarlas. */
export const MARCADORES_DESK_WINDOW_Z_START = 120

/**
 * Confirmaciones, errores de pegado y avisos demo: por encima de ventanas del escritorio
 * (z inline desde {@link MARCADORES_DESK_WINDOW_Z_START}) y del resto del chrome.
 */
export const MARCADORES_GLOBAL_ALERT_Z_CLASS = "z-[50000]" as const
