/** Fantasma de arrastre más visible que el predeterminado del navegador (HTML5 DnD). */
export function applyBookmarkDragPreview(e: React.DragEvent<Element>): void {
  const node = e.currentTarget
  if (!(node instanceof HTMLElement)) return

  try {
    const ghost = node.cloneNode(true) as HTMLElement
    const w = node.offsetWidth
    ghost.style.cssText = [
      "box-sizing:border-box",
      "position:fixed",
      "left:-10000px",
      "top:0",
      `width:${w}px`,
      "opacity:0.95",
      "pointer-events:none",
      "box-shadow:0 16px 40px rgba(0,0,0,0.28),0 0 0 1px rgba(255,255,255,0.06) inset",
      "z-index:2147483647",
    ].join(";")
    document.body.appendChild(ghost)

    const rect = node.getBoundingClientRect()
    const ox = Math.max(0, Math.min(rect.width, e.clientX - rect.left))
    const oy = Math.max(0, Math.min(rect.height, e.clientY - rect.top))
    e.dataTransfer.setDragImage(ghost, ox, oy)

    requestAnimationFrame(() => {
      ghost.remove()
    })
  } catch {
    /* algunos entornos pueden bloquear setDragImage */
  }
}
