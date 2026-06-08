import type { Dispatch, SetStateAction } from "react"

/** Si la carpeta abierta quedó dentro del subárbol eliminado, volver al padre del nodo borrado. */
export function repointBrowseAfterFolderDelete(opts: {
  deletedSubtreeIds: Set<string>
  fallbackParentId: string | null
  globalSelectedFolderId: string | null
  setGlobalSelectedFolderId: (id: string | null) => void
  deskFolderByWin: Record<string, string | null>
  setDeskFolderByWin: Dispatch<SetStateAction<Record<string, string | null>>>
}): void {
  const { deletedSubtreeIds, fallbackParentId } = opts

  if (opts.globalSelectedFolderId && deletedSubtreeIds.has(opts.globalSelectedFolderId)) {
    opts.setGlobalSelectedFolderId(fallbackParentId)
  }

  opts.setDeskFolderByWin((prev) => {
    let changed = false
    const next = { ...prev }
    for (const winId of Object.keys(next)) {
      const openFolderId = next[winId]
      if (openFolderId && deletedSubtreeIds.has(openFolderId)) {
        next[winId] = fallbackParentId
        changed = true
      }
    }
    return changed ? next : prev
  })
}
