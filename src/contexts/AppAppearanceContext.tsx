"use client"

import { createContext, use, useEffect, useLayoutEffect, useRef, useSyncExternalStore, type ReactNode } from "react"

import {
  type AppAppearanceState,
  applyCustomColorVars,
  applyDeskWindowGlass,
  applyTextSelectionHighlight,
  applyWallpaperToBody,
  defaultAppAppearanceState,
  loadAppAppearanceFromStorage,
  resolveDarkClass,
  saveAppAppearanceToStorage,
  type AppCustomColors,
  type AppThemePreset,
} from "@/lib/appAppearance"

const APPEARANCE_CHANGE_EVENT = "marcadores-appearance-change"

type AppAppearanceContextValue = {
  appearance: AppAppearanceState
  setTheme: (t: AppThemePreset) => void
  setUseCustomPalette: (v: boolean) => void
  setCustomColor: (key: keyof AppCustomColors, value: string) => void
  resetCustomColors: () => void
  setWallpaper: (dataUrl: string | null) => void
  setWallpaperVeil: (v: number) => void
  setDeskWindowTransparency: (v: number) => void
  setTextSelection: (value: string | null) => void
  resetAllAppearance: () => void
}

const AppAppearanceContext = createContext<AppAppearanceContextValue | null>(null)

function emitAppearanceChange(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new Event(APPEARANCE_CHANGE_EVENT))
}

function subscribeAppearance(onStoreChange: () => void): () => void {
  const notify = () => onStoreChange()
  window.addEventListener(APPEARANCE_CHANGE_EVENT, notify)
  window.addEventListener("visibilitychange", notify)
  window.addEventListener("storage", notify)
  return () => {
    window.removeEventListener(APPEARANCE_CHANGE_EVENT, notify)
    window.removeEventListener("visibilitychange", notify)
    window.removeEventListener("storage", notify)
  }
}

/** Clave estable para que `useSyncExternalStore` no re-renderice en bucle. */
function appearanceSnapshotKey(state: AppAppearanceState): string {
  const { wallpaperDataUrl, customColors, ...rest } = state
  return JSON.stringify({
    ...rest,
    customColors,
    wallpaperLen: wallpaperDataUrl?.length ?? 0,
    wallpaperHead: wallpaperDataUrl?.slice(0, 96) ?? "",
  })
}

let cachedSnapshot: AppAppearanceState = defaultAppAppearanceState
let cachedSnapshotKey = ""

function commitAppearanceSnapshot(next: AppAppearanceState): void {
  cachedSnapshotKey = appearanceSnapshotKey(next)
  cachedSnapshot = next
}

function readAppearanceSnapshot(): AppAppearanceState {
  const fresh = loadAppAppearanceFromStorage()
  const key = appearanceSnapshotKey(fresh)
  if (key === cachedSnapshotKey) return cachedSnapshot
  commitAppearanceSnapshot(fresh)
  return cachedSnapshot
}

function syncDom(next: AppAppearanceState): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  const useDark = resolveDarkClass(next.theme)

  root.classList.toggle("dark", useDark)

  applyCustomColorVars(next.customColors, next.useCustomPalette)
  applyTextSelectionHighlight(next)
  applyWallpaperToBody(next)
  applyDeskWindowGlass(next)
}

function persistState(next: AppAppearanceState): void {
  saveAppAppearanceToStorage(next)
  commitAppearanceSnapshot(next)
  syncDom(next)
  emitAppearanceChange()
}

type AppAppearanceProviderProps = {
  children: ReactNode
  /** Valor leído en el servidor desde la cookie (sin tapiz). */
  initialAppearance?: AppAppearanceState
}

export function AppAppearanceProvider({
  children,
  initialAppearance = defaultAppAppearanceState,
}: AppAppearanceProviderProps) {
  const serverSnapshotRef = useRef(initialAppearance)

  const appearance = useSyncExternalStore(subscribeAppearance, readAppearanceSnapshot, () => serverSnapshotRef.current)

  useLayoutEffect(() => {
    syncDom(appearance)
  }, [appearance])

  const update = (updater: (prev: AppAppearanceState) => AppAppearanceState) => {
    const next = updater(readAppearanceSnapshot())
    persistState(next)
  }

  useEffect(() => {
    if (appearance.theme !== "system") return

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      if (readAppearanceSnapshot().theme !== "system") return
      syncDom(readAppearanceSnapshot())
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [appearance.theme])

  const setTheme = (t: AppThemePreset) => {
    update((prev) => ({ ...prev, theme: t }))
  }

  const setUseCustomPalette = (v: boolean) => {
    update((prev) => ({ ...prev, useCustomPalette: v }))
  }

  const setCustomColor = (key: keyof AppCustomColors, value: string) => {
    update((prev) => ({
      ...prev,
      customColors: { ...prev.customColors, [key]: value },
    }))
  }

  const resetCustomColors = () => {
    update((prev) => ({ ...prev, customColors: {} }))
  }

  const setWallpaper = (dataUrl: string | null) => {
    update((prev) => ({ ...prev, wallpaperDataUrl: dataUrl }))
  }

  const setWallpaperVeil = (v: number) => {
    update((prev) => ({ ...prev, wallpaperVeil: v }))
  }

  const setDeskWindowTransparency = (v: number) => {
    update((prev) => ({ ...prev, deskWindowTransparency: v }))
  }

  const setTextSelection = (value: string | null) => {
    update((prev) => ({
      ...prev,
      textSelection: value == null || value.trim() === "" ? null : value.trim(),
    }))
  }

  const resetAllAppearance = () => {
    persistState({ ...defaultAppAppearanceState })
  }

  const value = {
    appearance,
    setTheme,
    setUseCustomPalette,
    setCustomColor,
    resetCustomColors,
    setWallpaper,
    setWallpaperVeil,
    setDeskWindowTransparency,
    setTextSelection,
    resetAllAppearance,
  }

  return <AppAppearanceContext.Provider value={value}>{children}</AppAppearanceContext.Provider>
}

export function useAppAppearance(): AppAppearanceContextValue {
  const ctx = use(AppAppearanceContext)
  if (!ctx) {
    throw new Error("useAppAppearance debe usarse dentro de AppAppearanceProvider")
  }
  return ctx
}
