"use client"

import type { ResizeEdge } from "@/features/marcadores/desktop/desktopWindowGeometry"
import { EDGE_HIT } from "@/features/marcadores/desktop/desktopWindowGeometry"

type Props = {
  minimized: boolean
  maximized: boolean
  onResizePointerDown: (edge: ResizeEdge) => (e: React.PointerEvent) => void
}

/** Zonas de resize absolutas (no interferir con el contenido). */
export function DesktopWindowResizeHandles({ minimized, maximized, onResizePointerDown }: Props) {
  if (minimized || maximized) return null

  const hit = { width: EDGE_HIT, height: EDGE_HIT, padding: 0, border: "none" as const, background: "transparent" }

  return (
    <div className="pointer-events-none absolute inset-0 z-20" aria-hidden>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Redimensionar esquina superior izquierda"
        className="pointer-events-auto absolute top-0 left-0 z-10 cursor-nwse-resize"
        style={hit}
        onPointerDown={onResizePointerDown("nw")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Redimensionar esquina superior derecha"
        className="pointer-events-auto absolute top-0 right-0 z-10 cursor-nesw-resize"
        style={hit}
        onPointerDown={onResizePointerDown("ne")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Redimensionar esquina inferior izquierda"
        className="pointer-events-auto absolute bottom-0 left-0 z-10 cursor-nesw-resize"
        style={hit}
        onPointerDown={onResizePointerDown("sw")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Redimensionar esquina inferior derecha"
        className="pointer-events-auto absolute right-0 bottom-0 z-10 cursor-nwse-resize"
        style={hit}
        onPointerDown={onResizePointerDown("se")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Redimensionar borde superior"
        className="pointer-events-auto absolute top-0 z-[9] cursor-ns-resize"
        style={{
          height: EDGE_HIT,
          left: EDGE_HIT,
          right: EDGE_HIT,
          padding: 0,
          border: "none",
          background: "transparent",
        }}
        onPointerDown={onResizePointerDown("n")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Redimensionar borde inferior"
        className="pointer-events-auto absolute bottom-0 z-[9] cursor-ns-resize"
        style={{
          height: EDGE_HIT,
          left: EDGE_HIT,
          right: EDGE_HIT,
          padding: 0,
          border: "none",
          background: "transparent",
        }}
        onPointerDown={onResizePointerDown("s")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Redimensionar borde izquierdo"
        className="pointer-events-auto absolute left-0 z-[9] cursor-ew-resize"
        style={{
          width: EDGE_HIT,
          top: EDGE_HIT,
          bottom: EDGE_HIT,
          padding: 0,
          border: "none",
          background: "transparent",
        }}
        onPointerDown={onResizePointerDown("w")}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Redimensionar borde derecho"
        className="pointer-events-auto absolute right-0 z-[9] cursor-ew-resize"
        style={{
          width: EDGE_HIT,
          top: EDGE_HIT,
          bottom: EDGE_HIT,
          padding: 0,
          border: "none",
          background: "transparent",
        }}
        onPointerDown={onResizePointerDown("e")}
      />
    </div>
  )
}
