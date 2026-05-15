"use client"

import { useCallback, useRef, useState } from "react"

type MarqueeDraft = { x0: number; y0: number; x1: number; y1: number }

/** Rastro decorativo (solo visual) al arrastrar sobre el lienzo del escritorio. */
export function useDeskDecorMarquee() {
  const [marquee, setMarquee] = useState<MarqueeDraft | null>(null)
  const trackingRef = useRef(false)

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if (e.target !== e.currentTarget) return
    const el = e.currentTarget
    const b = el.getBoundingClientRect()
    const x = e.clientX - b.left
    const y = e.clientY - b.top
    trackingRef.current = true
    setMarquee({ x0: x, y0: y, x1: x, y1: y })
    el.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackingRef.current) return
    const el = e.currentTarget
    const b = el.getBoundingClientRect()
    const x = e.clientX - b.left
    const y = e.clientY - b.top
    setMarquee((m) => (m ? { ...m, x1: x, y1: y } : null))
  }, [])

  const end = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackingRef.current) return
    trackingRef.current = false
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
    setMarquee(null)
  }, [])

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      end(e)
    },
    [end]
  )

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      end(e)
    },
    [end]
  )

  return {
    marquee,
    marqueePointerHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onLostPointerCapture: () => {
        trackingRef.current = false
        setMarquee(null)
      },
    },
  }
}
