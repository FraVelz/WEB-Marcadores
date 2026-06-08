import type { Dispatch, SetStateAction } from "react"

import type { Folder } from "@/contexts/DashboardContext"
import type { Bookmark, FlatFolder } from "@/features/marcadores/utils/types"

export type UseMarcadoresActionsParams = {
  bookmarks: Bookmark[]
  setBookmarks: Dispatch<SetStateAction<Bookmark[]>>
  folders: FlatFolder[]
  setFolders: Dispatch<SetStateAction<FlatFolder[]>>
  setCtxFolders: (folders: Folder[]) => void
  refreshFolders: () => void
  refreshTags: () => void
  fetchData: () => Promise<void>
  /** Carpeta activa del pane enfocado (crear/pegar). */
  selectedFolderId: string | null
  /** Selección global del dashboard (modo simple / rail). */
  dashboardSelectedFolderId: string | null
  setGlobalSelectedFolderId: (id: string | null) => void
  deskFolderByWin: Record<string, string | null>
  setDeskFolderByWin: Dispatch<SetStateAction<Record<string, string | null>>>
  setDetailBookmark: Dispatch<SetStateAction<Bookmark | null>>
}
