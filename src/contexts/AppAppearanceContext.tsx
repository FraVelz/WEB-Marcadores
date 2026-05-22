"use client"

import { createContext, use, useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react"

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
  syncDom(next)
}

function reloadAppearanceFromClient(): AppAppearanceState {
  return loadAppAppearanceFromStorage()
}

function resolveInitialAppearance(serverAppearance: AppAppearanceState): AppAppearanceState {
  if (typeof window === "undefined") return serverAppearance
  return loadAppAppearanceFromStorage()
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
  const [appearance, setAppearance] = useState<AppAppearanceState>(() => resolveInitialAppearance(initialAppearance))

  useLayoutEffect(() => {
    const fresh = loadAppAppearanceFromStorage()
    setAppearance(fresh)
    syncDom(fresh)
  }, [])

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return
      const fresh = reloadAppearanceFromClient()
      setAppearance(fresh)
      syncDom(fresh)
    }
    document.addEventListener("visibilitychange", onVisible)
    return () => document.removeEventListener("visibilitychange", onVisible)
  }, [])

  const update = useCallback((updater: (prev: AppAppearanceState) => AppAppearanceState) => {
    setAppearance((prev) => {
      const next = updater(prev)
      persistState(next)
      return next
    })
  }, [])

  useEffect(() => {
    if (appearance.theme !== "system") return

    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const fresh = reloadAppearanceFromClient()
      if (fresh.theme !== "system") return
      setAppearance(fresh)
      syncDom(fresh)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [appearance.theme])

  const setTheme = useCallback(
    (t: AppThemePreset) => {
      update((prev) => ({ ...prev, theme: t }))
    },
    [update]
  )

  const setUseCustomPalette = useCallback(
    (v: boolean) => {
      update((prev) => ({ ...prev, useCustomPalette: v }))
    },
    [update]
  )

  const setCustomColor = useCallback(
    (key: keyof AppCustomColors, value: string) => {
      update((prev) => ({
        ...prev,
        customColors: { ...prev.customColors, [key]: value },
      }))
    },
    [update]
  )

  const resetCustomColors = useCallback(() => {
    update((prev) => ({ ...prev, customColors: {} }))
  }, [update])

  const setWallpaper = useCallback(
    (dataUrl: string | null) => {
      update((prev) => ({ ...prev, wallpaperDataUrl: dataUrl }))
    },
    [update]
  )

  const setWallpaperVeil = useCallback(
    (v: number) => {
      update((prev) => ({ ...prev, wallpaperVeil: v }))
    },
    [update]
  )

  const setDeskWindowTransparency = useCallback(
    (v: number) => {
      update((prev) => ({ ...prev, deskWindowTransparency: v }))
    },
    [update]
  )

  const setTextSelection = useCallback(
    (value: string | null) => {
      update((prev) => ({
        ...prev,
        textSelection: value == null || value.trim() === "" ? null : value.trim(),
      }))
    },
    [update]
  )

  const resetAllAppearance = useCallback(() => {
    const next = { ...defaultAppAppearanceState }
    setAppearance(next)
    persistState(next)
  }, [])

  const value = useMemo<AppAppearanceContextValue>(
    () => ({
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
    }),
    [
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
    ]
  )

  return <AppAppearanceContext.Provider value={value}>{children}</AppAppearanceContext.Provider>
}

export function useAppAppearance(): AppAppearanceContextValue {
  const ctx = use(AppAppearanceContext)
  if (!ctx) {
    throw new Error("useAppAppearance debe usarse dentro de AppAppearanceProvider")
  }
  return ctx
}
