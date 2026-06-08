import type { DropTargetRecord } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types"

type DropLocation = {
  current: { dropTargets: DropTargetRecord[] }
}

const NESTED_DROP_TARGET_ATTR = "[data-drop-target-for-element]"

/** True when this target is the innermost drop target under the pointer. */
export function isInnermostDropTarget(location: DropLocation, self: DropTargetRecord): boolean {
  return location.current.dropTargets[0]?.element === self.element
}

/**
 * Panel/backdrop targets should not accept drops when the pointer is over a
 * nested item target; otherwise both fire onDrop and the parent move wins.
 */
export function canHostPanelBookmarkDrop(args: {
  input: { clientX: number; clientY: number }
  element: Element
}): boolean {
  const hit = document.elementFromPoint(args.input.clientX, args.input.clientY)
  if (!hit || !args.element.contains(hit)) return false

  const nestedDropTarget = hit.closest(NESTED_DROP_TARGET_ATTR)
  return !nestedDropTarget || nestedDropTarget === args.element
}
