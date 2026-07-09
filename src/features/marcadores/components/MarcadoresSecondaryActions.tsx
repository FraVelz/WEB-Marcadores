"use client"

import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"

import ToolbarNewFolderSection from "./ToolbarNewFolderSection"
import ToolbarRenameFolderSection from "./ToolbarRenameFolderSection"
import ToolbarSelectActions from "./ToolbarSelectActions"

type Props = {
  onNavigateUp: () => void
  onAddBookmark: () => void
  onNewFolder: () => void
  onDeleteFocused?: () => void
  hasFocusedItem: boolean
  selectMode: boolean
  setSelectMode: (v: boolean | ((prev: boolean) => boolean)) => void
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  onEdit: () => void
  onDelete: () => void
  showNewFolder: boolean
  setShowNewFolder: (v: boolean) => void
  newFolderName: string
  setNewFolderName: (v: string) => void
  onCreateFolder: () => void
  editingFolder: { id: string; name: string } | null
  setEditingFolder: (v: { id: string; name: string } | null) => void
  renameFolderName: string
  setRenameFolderName: (v: string) => void
  onRenameFolder: () => void
  duplicateClusterCount?: number
}

/** Acciones secundarias compactas bajo la cabecera principal de Marcadores. */
export function MarcadoresSecondaryActions({
  onNavigateUp,
  onAddBookmark,
  onNewFolder,
  onDeleteFocused,
  hasFocusedItem,
  selectMode,
  setSelectMode,
  selectedIds,
  setSelectedIds,
  onEdit,
  onDelete,
  showNewFolder,
  setShowNewFolder,
  newFolderName,
  setNewFolderName,
  onCreateFolder,
  editingFolder,
  setEditingFolder,
  renameFolderName,
  setRenameFolderName,
  onRenameFolder,
  duplicateClusterCount,
}: Props) {
  const iconBtn = cn(
    "text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded-lg p-2 transition-colors",
    FOCUS_RING_ICON_BTN
  )

  return (
    <div className="border-app-border bg-app-toolbar/60 flex flex-col gap-2 border-b px-3 py-1.5 md:px-4">
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        <button type="button" onClick={onNavigateUp} className={iconBtn} title="Subir carpeta">
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
          </svg>
        </button>
        <button type="button" onClick={onAddBookmark} className={iconBtn} title="Nuevo marcador">
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <button type="button" onClick={onNewFolder} className={iconBtn} title="Nueva carpeta">
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        </button>
        {hasFocusedItem && onDeleteFocused ? (
          <button
            type="button"
            onClick={onDeleteFocused}
            className={cn(iconBtn, "hover:bg-app-danger/15 hover:text-app-danger-fg")}
            title="Eliminar"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
          </button>
        ) : null}

        <div className="bg-app-border mx-1 h-5 w-px" />

        <ToolbarSelectActions
          selectMode={selectMode}
          setSelectMode={setSelectMode}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {duplicateClusterCount != null && duplicateClusterCount > 0 ? (
          <p className="text-app-fg-muted ml-auto shrink-0 text-[11px]">
            Posibles duplicados: <span className="text-app-accent font-medium">{duplicateClusterCount}</span>
          </p>
        ) : null}
      </div>

      {showNewFolder ? (
        <ToolbarNewFolderSection
          newFolderName={newFolderName}
          setNewFolderName={setNewFolderName}
          onCreateFolder={onCreateFolder}
          onCancel={() => setShowNewFolder(false)}
        />
      ) : null}

      {editingFolder ? (
        <ToolbarRenameFolderSection
          folderName={renameFolderName}
          setFolderName={setRenameFolderName}
          onRename={onRenameFolder}
          onCancel={() => setEditingFolder(null)}
        />
      ) : null}
    </div>
  )
}
