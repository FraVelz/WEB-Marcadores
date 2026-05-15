"use client"

import { cn } from "@/lib/utils"

type Props = {
  onNavigateUp: () => void
  onAddBookmark: () => void
  onNewFolder: () => void
  onDeleteFocused?: () => void
  hasFocusedItem: boolean
  infoPanelEnabled: boolean
  onToggleInfoPanel: () => void
  showSearch: boolean
  onToggleSearch: () => void
  treeView?: boolean
  onToggleTreeView?: () => void
  treeToggleDisabled?: boolean
}

export default function ToolbarNavigationButtons({
  onNavigateUp,
  onAddBookmark,
  onNewFolder,
  onDeleteFocused,
  hasFocusedItem,
  infoPanelEnabled,
  onToggleInfoPanel,
  showSearch,
  onToggleSearch,
  treeView,
  onToggleTreeView,
  treeToggleDisabled = false,
}: Props) {
  return (
    <>
      <button
        type="button"
        onClick={onNavigateUp}
        className="text-app-fg-muted hover:bg-app-active hover:text-app-fg rounded p-1.5"
        title="Subir"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" />
        </svg>
      </button>
      <div className="bg-app-active mx-1 h-5 w-px" />
      <button
        type="button"
        onClick={onAddBookmark}
        className="text-app-fg-muted hover:bg-app-active hover:text-app-fg rounded p-1.5"
        title="Nuevo marcador"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onNewFolder}
        className="text-app-fg-muted hover:bg-app-active hover:text-app-fg rounded p-1.5"
        title="Nueva carpeta"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </button>
      {hasFocusedItem && onDeleteFocused && (
        <button
          type="button"
          onClick={onDeleteFocused}
          className="text-app-fg-muted hover:bg-app-danger/15 hover:text-app-danger-fg rounded p-1.5"
          title="Eliminar (dd)"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
        </button>
      )}
      <button
        type="button"
        onClick={onToggleInfoPanel}
        className={cn(
          "rounded p-1.5",
          infoPanelEnabled ? "bg-app-active text-app-fg" : "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
        )}
        title="Modo información (i)"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-4h-2V7h2v2z" />
        </svg>
      </button>
      <div className="bg-app-active mx-1 h-5 w-px" />
      {onToggleTreeView && !treeToggleDisabled && (
        <button
          type="button"
          onClick={onToggleTreeView}
          className={cn(
            "rounded p-1.5",
            treeView ? "bg-app-active text-app-fg" : "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
          )}
          title={treeView ? "Vista cuadrícula" : "Vista árbol en el contenido principal"}
        >
          {treeView ? (
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z" />
            </svg>
          ) : (
            <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 12h8v2H8v-2zm0 4h5v2H8v-2z" />
            </svg>
          )}
        </button>
      )}
      <button
        type="button"
        onClick={onToggleSearch}
        className={cn(
          "rounded p-1.5",
          showSearch ? "bg-app-active text-app-fg" : "text-app-fg-muted hover:bg-app-active hover:text-app-fg"
        )}
        title="Buscar (Ctrl+F)"
      >
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path
            d={
              "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 " +
              "5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 " +
              "0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            }
          />
        </svg>
      </button>
    </>
  )
}
