export const DESKTOP_LAYOUT_TOOL_BTN_ROW =
  "focus-visible:ring-app-focus inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium outline-none focus-visible:ring-2"

export function desktopLayoutToolBtnState(enabled: boolean) {
  return enabled
    ? "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
    : "text-app-fg-muted cursor-not-allowed opacity-45"
}
