import type { MarcadoresDesktopLayoutV2, PersistedDesktopWindowV2 } from "@/features/marcadores/desktop/windowTypes"
import { DESKTOP_DETAIL_WINDOW_ID } from "@/features/marcadores/desktop/windowTypes"

import type { LibFrame } from "@/features/marcadores/desktop/shell/desktopShellGeometry"

import { writeTabScopedItem } from "@/lib/tabScopedStorage"

export function buildPersistedLayoutPayload(
  libraryWindowIds: string[],
  libFrames: Record<string, LibFrame>,
  detailFrame: LibFrame | null
): MarcadoresDesktopLayoutV2 {
  const wins: PersistedDesktopWindowV2[] = []
  for (const id of libraryWindowIds) {
    const f = libFrames[id]
    if (!f) continue
    wins.push({
      id,
      kind: "library",
      ...f.bounds,
      minimized: f.minimized,
      maximized: f.maximized,
    })
  }
  if (detailFrame) {
    wins.push({
      id: DESKTOP_DETAIL_WINDOW_ID,
      kind: "detail",
      ...detailFrame.bounds,
      minimized: detailFrame.minimized,
      maximized: detailFrame.maximized,
    })
  }
  return { v: 2, libraryWindowIds: [...libraryWindowIds], windows: wins }
}

export function persistDeskLayoutJson(storageKey: string, payload: MarcadoresDesktopLayoutV2): void {
  try {
    writeTabScopedItem(storageKey, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}
