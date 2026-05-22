"use client"

import type { AppAppearanceState } from "@/lib/appAppearance"
import { wallpaperBackdropStyle } from "@/lib/appAppearance"

type Props = Pick<AppAppearanceState, "wallpaperDataUrl" | "wallpaperVeil">

/** Capa fija detrás del shell del dashboard; el contenido usa fondos transparentes cuando hay tapiz. */
export function DashboardWallpaperBackdrop({ wallpaperDataUrl, wallpaperVeil }: Props) {
  const layer = wallpaperBackdropStyle({ wallpaperDataUrl, wallpaperVeil })
  if (!layer) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        backgroundColor: layer.backgroundColor,
        backgroundImage: layer.backgroundImage,
        backgroundSize: layer.backgroundSize,
        backgroundAttachment: layer.backgroundAttachment,
        backgroundRepeat: layer.backgroundRepeat,
      }}
    />
  )
}
