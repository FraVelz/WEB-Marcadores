"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { DesktopShortcut } from "@/features/marcadores/desktop/DesktopShortcut"

const DEFAULT_XY = { x: 12, y: 12 }
const DRAG_SLIP_PX = 6
const PAD = 6

function clampPos(
  x: number,
  y: number,
  hostW: number,
  hostH: number,
  elW: number,
  elH: number
): { x: number; y: number } {
  const maxX = Math.max(PAD, hostW - elW - PAD)
  const maxY = Math.max(PAD, hostH - elH - PAD)
  return {
    x: Math.min(maxX, Math.max(PAD, x)),
    y: Math.min(maxY, Math.max(PAD, y)),
  }
}

export function DesktopDraggableLibraryShortcut(props: {
  hostRef: React.RefObject<HTMLElement | null>
  storageKey: string
  selected: boolean
  onSelect: () => void
  onOpen: () => void
}) {
  const { hostRef, storageKey, selected, onSelect, onOpen } = props
  const wrapRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState(DEFAULT_XY)
  const latestPosRef = useRef(pos)
  const gestureCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    latestPosRef.current = pos
  }, [pos])

  const persist = useCallback(
    (p: { x: number; y: number }) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(p))
      } catch {
        /* ignore */
      }
    },
    [storageKey]
  )

  const reclamp = useCallback(() => {
    const host = hostRef.current
    const el = wrapRef.current
    if (!host || !el) return
    const hr = host.getBoundingClientRect()
    const er = el.getBoundingClientRect()
    if (hr.width <= 0 || hr.height <= 0 || er.width <= 0 || er.height <= 0) return
    setPos((prev) => {
      const next = clampPos(prev.x, prev.y, hr.width, hr.height, er.width, er.height)
      if (next.x === prev.x && next.y === prev.y) return prev
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        /* ignore */
      }
      return next
    })
  }, [hostRef, storageKey])

  const reclampRef = useRef(reclamp)
  useEffect(() => {
    reclampRef.current = reclamp
  }, [reclamp])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        const p = JSON.parse(raw) as { x?: unknown; y?: unknown }
        if (typeof p.x === "number" && typeof p.y === "number") {
          setPos({ x: p.x, y: p.y })
          requestAnimationFrame(() => reclampRef.current())
          return
        }
      }
    } catch {
      /* ignore */
    }
    setPos(DEFAULT_XY)
    requestAnimationFrame(() => reclampRef.current())
  }, [storageKey])

  useEffect(() => {
    const host = hostRef.current
    if (!host || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(() => {
      queueMicrotask(reclamp)
    })
    ro.observe(host)
    return () => ro.disconnect()
  }, [hostRef, reclamp])

  useEffect(() => () => gestureCleanupRef.current?.(), [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return
      const t = e.target
      if (!(t instanceof Node) || !wrapRef.current?.contains(t)) return

      const host = hostRef.current
      const el = wrapRef.current
      if (!host || !el) return

      gestureCleanupRef.current?.()
      onSelect()

      const pointerId = e.pointerId
      const startX = e.clientX
      const startY = e.clientY
      const hr0 = host.getBoundingClientRect()
      const er0 = el.getBoundingClientRect()
      const dx = e.clientX - er0.left
      const dy = e.clientY - er0.top
      let kind: "pending" | "drag" = "pending"

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        const h = hostRef.current
        const box = wrapRef.current
        if (!h || !box) return
        const hr = h.getBoundingClientRect()
        const er = box.getBoundingClientRect()
        if (kind === "pending") {
          if (Math.abs(ev.clientX - startX) < DRAG_SLIP_PX && Math.abs(ev.clientY - startY) < DRAG_SLIP_PX) return
          kind = "drag"
        }
        const next = clampPos(ev.clientX - hr.left - dx, ev.clientY - hr.top - dy, hr.width, hr.height, er.width, er.height)
        latestPosRef.current = next
        setPos(next)
      }

      const onUpOrCancel = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        document.removeEventListener("pointermove", onMove)
        document.removeEventListener("pointerup", onUpOrCancel)
        document.removeEventListener("pointercancel", onUpOrCancel)
        gestureCleanupRef.current = null
        if (kind === "drag") {
          persist(latestPosRef.current)
        }
      }

      gestureCleanupRef.current = () => {
        document.removeEventListener("pointermove", onMove)
        document.removeEventListener("pointerup", onUpOrCancel)
        document.removeEventListener("pointercancel", onUpOrCancel)
        gestureCleanupRef.current = null
      }

      document.addEventListener("pointermove", onMove)
      document.addEventListener("pointerup", onUpOrCancel)
      document.addEventListener("pointercancel", onUpOrCancel)
    },
    [hostRef, onSelect, persist]
  )

  return (
    <div ref={wrapRef} className="pointer-events-auto absolute z-[8] touch-none select-none" style={{ left: pos.x, top: pos.y }} onPointerDown={onPointerDown}>
      <DesktopShortcut label="Marcadores" icon={<span aria-hidden>📚</span>} onDoubleClick={onOpen} selected={selected} />
    </div>
  )
}
