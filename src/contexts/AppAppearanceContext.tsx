"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  type AppAppearanceState,
  applyCustomColorVars,
  applyWallpaperToBody,
  defaultAppAppearanceState,
  loadAppAppearanceFromStorage,
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
  resetAllAppearance: () => void
}

const AppAppearanceContext = createContext<AppAppearanceContextValue | null>(null)

function syncDom(next: AppAppearanceState): void {
  if (typeof document === "undefined") return

  const root = document.documentElement
  const prefersDark = typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : true
  const useDark = next.theme === "dark" || (next.theme === "system" && prefersDark)

  root.classList.toggle("dark", useDark)

  applyCustomColorVars(next.customColors, next.useCustomPalette)
  applyWallpaperToBody(next)
}

function persistState(next: AppAppearanceState): void {
  saveAppAppearanceToStorage(next)
  syncDom(next)
}

export function AppAppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<AppAppearanceState>(() =>
    typeof window !== "undefined" ? loadAppAppearanceFromStorage() : defaultAppAppearanceState
  )

  useLayoutEffect(() => {
    syncDom(loadAppAppearanceFromStorage())
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
      const fresh = loadAppAppearanceFromStorage()
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
      resetAllAppearance,
    ]
  )

  return <AppAppearanceContext.Provider value={value}>{children}</AppAppearanceContext.Provider>
}

export function useAppAppearance(): AppAppearanceContextValue {
  const ctx = useContext(AppAppearanceContext)
  if (!ctx) {
    throw new Error("useAppAppearance debe usarse dentro de AppAppearanceProvider")
  }
  return ctx
}
