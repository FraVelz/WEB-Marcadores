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
  selectedFolderId: string | null
  setDetailBookmark: Dispatch<SetStateAction<Bookmark | null>>
}
