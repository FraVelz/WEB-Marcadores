import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/element/preserve-offset-on-source"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview"
import type { ElementEventPayloadMap } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

type PreviewArgs = ElementEventPayloadMap["onGenerateDragPreview"]

export function attachBookmarkDragPreview({ nativeSetDragImage, source, location }: PreviewArgs): void {
  if (!nativeSetDragImage) return

  setCustomNativeDragPreview({
    nativeSetDragImage,
    getOffset: preserveOffsetOnSource({
      element: source.element,
      input: location.current.input,
    }),
    render: ({ container }) => {
      const ghost = source.element.cloneNode(true) as HTMLElement
      const width = source.element.offsetWidth
      ghost.style.cssText = [
        "box-sizing:border-box",
        `width:${width}px`,
        "opacity:0.95",
        "pointer-events:none",
        "box-shadow:0 16px 40px rgba(0,0,0,0.28),0 0 0 1px rgba(255,255,255,0.06) inset",
      ].join(";")
      container.appendChild(ghost)
      return () => {
        ghost.remove()
      }
    },
  })
}
