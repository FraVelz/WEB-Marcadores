"use client"

import type { Folder } from "@/contexts/DashboardContext"

import { cn } from "@/lib/utils"

type Props = {
  folders: Folder[]
  selectedFolderId: string | null
  onSelect: (folderId: string | null) => void
  collapsedIds: Set<string>
  onToggle: (folderId: string) => void
}

function FolderIcon() {
  return (
    <svg className="text-app-folder size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  )
}

function TreeLevel({ folders, selectedFolderId, onSelect, collapsedIds, onToggle, depth }: Props & { depth: number }) {
  return (
    <>
      {folders.map((folder) => {
        const isCollapsed = collapsedIds.has(folder.id)
        const isSelected = selectedFolderId === folder.id
        const hasChildren = folder.children && folder.children.length > 0
        return (
          <div key={folder.id} className="select-none">
            <button
              type="button"
              onClick={() => {
                if (hasChildren) onToggle(folder.id)
                onSelect(folder.id)
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
                isSelected
                  ? "bg-app-list-selected text-app-fg"
                  : "text-app-fg-secondary hover:bg-app-hover hover:text-app-fg"
              )}
              style={{ paddingLeft: `${8 + depth * 12}px` }}
            >
              <span className="text-app-fg-label w-4 flex-shrink-0">
                {hasChildren ? (isCollapsed ? "▶" : "▼") : " "}
              </span>
              <FolderIcon />
              <span className="truncate">{folder.name}</span>
            </button>
            {hasChildren && !isCollapsed && (
              <TreeLevel
                folders={folder.children!}
                selectedFolderId={selectedFolderId}
                onSelect={onSelect}
                collapsedIds={collapsedIds}
                onToggle={onToggle}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

export default function ExplorerTree({ folders, selectedFolderId, onSelect, collapsedIds, onToggle }: Props) {
  return (
    <div className="flex flex-col gap-0.5 py-1">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
          !selectedFolderId
            ? "bg-app-list-selected text-app-fg"
            : "text-app-fg-secondary hover:bg-app-hover hover:text-app-fg"
        )}
      >
        <svg className="text-app-accent size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path
            d={
              "M3 3h8v2H3V3zm0 4h8v2H3V7zm0 4h8v2H3v-2zm0 4h8v2H3v-2z" +
              "m10-8h8v2h-8V3zm0 4h8v2h-8V7zm0 4h8v2h-8v-2zm0 4h8v2h-8v-2z"
            }
          />
        </svg>
        <span>Marcadores</span>
      </button>
      <TreeLevel
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelect={onSelect}
        collapsedIds={collapsedIds}
        onToggle={onToggle}
        depth={0}
      />
    </div>
  )
}
