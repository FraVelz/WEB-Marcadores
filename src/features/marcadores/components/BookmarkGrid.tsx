"use client";

import type { GridItem, CutItem } from "../types";
import BookmarkGridItem from "./BookmarkGridItem";

const DRAG_TYPE = "application/x-bookmark-item";

type Props = {
  flatList: GridItem[];
  selectedIndex: number;
  selectMode: boolean;
  selectedIds: Set<string>;
  cutItem: CutItem | null;
  onSelectIndex: (idx: number) => void;
  onToggleSelect: (id: string) => void;
  onDoubleClick: (item: GridItem) => void;
  onDrop?: (sourceItem: GridItem, targetFolderId: string | null) => void;
  onAddBookmark: () => void;
  onNewFolder: () => void;
  itemRefs: React.MutableRefObject<Map<number, HTMLDivElement>>;
};

export default function BookmarkGrid({
  flatList,
  selectedIndex,
  selectMode,
  selectedIds,
  cutItem,
  onSelectIndex,
  onToggleSelect,
  onDoubleClick,
  onDrop,
  onAddBookmark,
  onNewFolder,
  itemRefs,
}: Props) {
  return (
    <div
      className="flex-1 overflow-auto p-4"
      onDragOver={onDrop ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; } : undefined}
      onDrop={onDrop ? (e) => {
        e.preventDefault();
        const raw = e.dataTransfer.getData(DRAG_TYPE);
        if (!raw) return;
        try {
          const payload = JSON.parse(raw);
          const sourceItem: GridItem =
            payload.type === "folder"
              ? { type: "folder", id: payload.id, folderId: payload.id, label: payload.name }
              : { type: "link", bookmark: { id: payload.bookmark.id, title: "", url: payload.bookmark.url, folder_id: null } };
          onDrop(sourceItem, null);
        } catch {
          // ignore
        }
      } : undefined}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {flatList.map((item, idx) => {
          const isFolder = item.type === "folder";
          const isCut =
            cutItem &&
            ((isFolder && cutItem.type === "folder" && cutItem.id === item.id) ||
              (!isFolder && cutItem.type === "link" && cutItem.bookmark.id === item.bookmark.id));
          return (
            <BookmarkGridItem
              key={isFolder ? item.id : item.bookmark.id}
              item={item}
              idx={idx}
              isSelected={idx === selectedIndex}
              isCut={!!isCut}
              selectMode={selectMode}
              isChecked={!isFolder && selectedIds.has(item.bookmark.id)}
              itemRef={(el) => {
                if (el) itemRefs.current.set(idx, el);
              }}
              onSelect={onSelectIndex}
              onToggleSelect={onToggleSelect}
              onDoubleClick={onDoubleClick}
              onDrop={onDrop}
            />
          );
        })}
      </div>
      {flatList.length === 0 && (
        <EmptyState onAddBookmark={onAddBookmark} onNewFolder={onNewFolder} />
      )}
    </div>
  );
}

function EmptyState({
  onAddBookmark,
  onNewFolder,
}: {
  onAddBookmark: () => void;
  onNewFolder: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
      <svg
        className="mb-4 h-16 w-16 text-zinc-600"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
      <p className="text-sm">Esta carpeta está vacía</p>
      <button
        onClick={onAddBookmark}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
      >
        Agregar marcador
      </button>
      <button
        onClick={onNewFolder}
        className="mt-2 rounded border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
      >
        Nueva carpeta
      </button>
    </div>
  );
}
