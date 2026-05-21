"use client"

import { useCallback, useSyncExternalStore } from "react"

export const MARCADORES_VIEW_MODE_STORAGE_KEY = "marcadores-view-mode" as const

/** Mismo nombre que el evento interno (pestañas de la misma ventana). */
export const MARCADORES_VIEW_MODE_CHANGE_EVENT = "marcadores-view-mode-changed" as const

export type MarcadoresViewMode = "escritorio" | "simple"

const DEFAULT_MODE: MarcadoresViewMode = "simple"

function isMarcadoresViewMode(value: string): value is MarcadoresViewMode {
  return value === "escritorio" || value === "simple"
}

function readModeFromStorage(): MarcadoresViewMode {
  if (typeof window === "undefined") return DEFAULT_MODE
  try {
    const raw = window.localStorage.getItem(MARCADORES_VIEW_MODE_STORAGE_KEY)
    if (raw && isMarcadoresViewMode(raw)) return raw
  } catch {
    /* ignore */
  }
  return DEFAULT_MODE
}

function subscribe(onChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const onStorage = (e: StorageEvent) => {
    if (e.key === MARCADORES_VIEW_MODE_STORAGE_KEY || e.key === null) onChange()
  }
  const onSameTab = () => onChange()
  window.addEventListener("storage", onStorage)
  window.addEventListener(MARCADORES_VIEW_MODE_CHANGE_EVENT, onSameTab)
  return () => {
    window.removeEventListener("storage", onStorage)
    window.removeEventListener(MARCADORES_VIEW_MODE_CHANGE_EVENT, onSameTab)
  }
}

function getServerSnapshot(): MarcadoresViewMode {
  return DEFAULT_MODE
}

/** Escribe localStorage y notifica a `useMarcadoresViewMode` en esta pestaña. */
export function setMarcadoresViewMode(next: MarcadoresViewMode) {
  if (typeof window === "undefined") return
  try {
    const prev = window.localStorage.getItem(MARCADORES_VIEW_MODE_STORAGE_KEY)
    window.localStorage.setItem(MARCADORES_VIEW_MODE_STORAGE_KEY, next)
    if (prev !== next) {
      window.dispatchEvent(new Event(MARCADORES_VIEW_MODE_CHANGE_EVENT))
    }
  } catch {
    /* ignore */
  }
}

/**
 * Preferencia Escritorio (marco ventana) vs Simple (vista integrada ancha).
 * Estado en localStorage + `useSyncExternalStore` (sin hidratar vía useEffect).
 */
export function useMarcadoresViewMode() {
  const mode = useSyncExternalStore(subscribe, readModeFromStorage, getServerSnapshot)
  const setMode = useCallback((next: MarcadoresViewMode) => {
    setMarcadoresViewMode(next)
  }, [])
  return { mode, setMode } as const
}
