"use client"

import type { Folder } from "@/contexts/DashboardContext"

import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN, KEYBOARD_SELECTED } from "@/lib/focusStyles"

type Props = {
  folders: Folder[]
  selectedFolderId: string | null
  onSelect: (folderId: string | null) => void
  collapsedIds: Set<string>
  onToggle: (folderId: string) => void
  folderBookmarkCounts?: Map<string | null, number>
}

function FolderIcon() {
  return (
    <svg className="size-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
  )
}

function countLabel(counts: Map<string | null, number> | undefined, folderId: string | null): string | null {
  if (!counts) return null
  const n = counts.get(folderId)
  return n != null && n > 0 ? String(n) : null
}

function rowClass(isSelected: boolean) {
  return cn(
    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
    isSelected
      ? cn(KEYBOARD_SELECTED, "text-app-fg font-medium")
      : cn("text-app-fg-secondary hover:bg-app-hover hover:text-app-fg", FOCUS_RING_ICON_BTN)
  )
}

function TreeLevel({
  folders,
  selectedFolderId,
  onSelect,
  collapsedIds,
  onToggle,
  folderBookmarkCounts,
  depth,
}: Props & { depth: number }) {
  return (
    <>
      {folders.map((folder) => {
        const isCollapsed = collapsedIds.has(folder.id)
        const isSelected = selectedFolderId === folder.id
        const hasChildren = folder.children && folder.children.length > 0
        const count = countLabel(folderBookmarkCounts, folder.id)
        return (
          <div key={folder.id} className="select-none">
            <button
              type="button"
              onClick={() => {
                if (hasChildren) onToggle(folder.id)
                onSelect(folder.id)
              }}
              className={rowClass(isSelected)}
              style={{ paddingLeft: `${10 + depth * 12}px` }}
            >
              <span className="text-app-fg-muted w-4 shrink-0 text-xs">
                {hasChildren ? (isCollapsed ? "▶" : "▼") : " "}
              </span>
              <FolderIcon />
              <span className="min-w-0 flex-1 truncate">{folder.name}</span>
              {count ? <span className="text-app-fg-muted shrink-0 text-xs tabular-nums">{count}</span> : null}
            </button>
            {hasChildren && !isCollapsed ? (
              <TreeLevel
                folders={folder.children!}
                selectedFolderId={selectedFolderId}
                onSelect={onSelect}
                collapsedIds={collapsedIds}
                onToggle={onToggle}
                folderBookmarkCounts={folderBookmarkCounts}
                depth={depth + 1}
              />
            ) : null}
          </div>
        )
      })}
    </>
  )
}

export default function ExplorerTree({
  folders,
  selectedFolderId,
  onSelect,
  collapsedIds,
  onToggle,
  folderBookmarkCounts,
}: Props) {
  const rootCount = countLabel(folderBookmarkCounts, null)

  return (
    <div className="flex flex-col gap-0.5 py-1">
      <button type="button" onClick={() => onSelect(null)} className={rowClass(!selectedFolderId)}>
        <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        <span className="min-w-0 flex-1 truncate">Todos</span>
        {rootCount ? <span className="text-app-fg-muted shrink-0 text-xs tabular-nums">{rootCount}</span> : null}
      </button>
      <TreeLevel
        folders={folders}
        selectedFolderId={selectedFolderId}
        onSelect={onSelect}
        collapsedIds={collapsedIds}
        onToggle={onToggle}
        folderBookmarkCounts={folderBookmarkCounts}
        depth={0}
      />
    </div>
  )
}
