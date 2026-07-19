"use client"

import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"

import type { ImportSummary } from "../hooks/persistMarcadoresImport"
import type { FlatFolder } from "../utils/types"

import { ToolbarImportExportSection } from "./ToolbarImportExportSection"
import ToolbarNewFolderSection from "./ToolbarNewFolderSection"
import ToolbarRenameFolderSection from "./ToolbarRenameFolderSection"
import ToolbarSelectActions from "./ToolbarSelectActions"

type Props = {
  onNavigateUp: () => void
  onAddBookmark: () => void
  onNewFolder: () => void
  onDeleteFocused?: () => void
  /** Renombrar la carpeta enfocada (clic / teclado), no hace falta modo seleccionar. */
  onRenameFocused?: () => void
  hasFocusedItem: boolean
  focusedIsFolder?: boolean
  selectMode: boolean
  setSelectMode: (v: boolean | ((prev: boolean) => boolean)) => void
  selectedIds: Set<string>
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<string>>>
  folders?: FlatFolder[]
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
  onExportJson?: () => void
  onImportFile?: (file: File) => Promise<ImportSummary>
}

/** Acciones secundarias compactas bajo la cabecera principal de Marcadores. */
export function MarcadoresSecondaryActions({
  onNavigateUp,
  onAddBookmark,
  onNewFolder,
  onDeleteFocused,
  onRenameFocused,
  hasFocusedItem,
  focusedIsFolder = false,
  selectMode,
  setSelectMode,
  selectedIds,
  setSelectedIds,
  folders = [],
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
  onExportJson,
  onImportFile,
}: Props) {
  const iconBtn = cn(
    "text-app-fg-muted hover:bg-app-hover hover:text-app-fg rounded-lg p-2 transition-colors",
    FOCUS_RING_ICON_BTN
  )

  return (
    <div className="border-app-border bg-app-toolbar/60 flex flex-col gap-2 border-b px-3 py-1.5 md:px-4">
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={onNavigateUp}
          className={iconBtn}
          title="Subir carpeta"
          aria-label="Subir carpeta"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onAddBookmark}
          className={iconBtn}
          title="Nuevo marcador"
          aria-label="Nuevo marcador"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onNewFolder}
          className={iconBtn}
          title="Nueva carpeta"
          aria-label="Nueva carpeta"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
        </button>
        {hasFocusedItem && focusedIsFolder && onRenameFocused ? (
          <button
            type="button"
            onClick={onRenameFocused}
            className={iconBtn}
            title="Renombrar carpeta"
            aria-label="Renombrar carpeta"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
          </button>
        ) : null}
        {hasFocusedItem && onDeleteFocused ? (
          <button
            type="button"
            onClick={onDeleteFocused}
            className={cn(iconBtn, "hover:bg-app-danger/15 hover:text-app-danger-fg")}
            title="Eliminar"
            aria-label="Eliminar"
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
          folders={folders}
          onEdit={onEdit}
          onDelete={onDelete}
        />

        {onExportJson && onImportFile ? (
          <>
            <div className="bg-app-border mx-1 h-5 w-px" />
            <ToolbarImportExportSection onExportJson={onExportJson} onImportFile={onImportFile} />
          </>
        ) : null}

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
