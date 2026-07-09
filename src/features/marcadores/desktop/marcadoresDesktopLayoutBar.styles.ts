export { DESKTOP_LAYOUT_TOOL_BTN_ROW } from "@/lib/focusStyles"

export function desktopLayoutToolBtnState(enabled: boolean) {
  return enabled
    ? "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
    : "text-app-fg-muted cursor-not-allowed opacity-45"
}
