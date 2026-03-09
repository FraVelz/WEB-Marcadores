"use client";

import { getFavicon } from "../utils";
import type { Bookmark, GridItem } from "../types";

type Props = {
  item: GridItem;
  idx: number;
  isSelected: boolean;
  isCut: boolean;
  selectMode: boolean;
  isChecked: boolean;
  itemRef: (el: HTMLDivElement | null) => void;
  onSelect: (idx: number) => void;
  onToggleSelect: (id: string) => void;
  onDoubleClick: (item: GridItem) => void;
};

export default function BookmarkGridItem({
  item,
  idx,
  isSelected,
  isCut,
  selectMode,
  isChecked,
  itemRef,
  onSelect,
  onToggleSelect,
  onDoubleClick,
}: Props) {
  const isFolder = item.type === "folder";
  const baseClass = `relative flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
    isCut ? "border-dashed border-amber-500/70 bg-amber-900/20 opacity-60" : ""
  } ${
    !isCut &&
    (isSelected
      ? "border-blue-500 bg-blue-600/20 ring-2 ring-blue-500"
      : "border-zinc-800 bg-zinc-900/80 hover:border-zinc-600 hover:bg-zinc-800/50")
  } ${selectMode && !isFolder ? "cursor-pointer" : ""}`;

  return (
    <div
      key={isFolder ? item.id : item.bookmark.id}
      ref={itemRef}
      className={baseClass}
      onClick={() => {
        if (selectMode && !isFolder) onToggleSelect(item.bookmark.id);
        else onSelect(idx);
      }}
      onDoubleClick={() => onDoubleClick(item)}
    >
      {selectMode && !isFolder && (
        <div
          className="absolute left-3 top-3 z-10"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect(item.bookmark.id);
          }}
        >
          <input
            type="checkbox"
            checked={isChecked}
            readOnly
            className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-blue-500"
          />
        </div>
      )}
      {isFolder ? (
        <FolderContent label={item.label} />
      ) : (
        <LinkContent bookmark={item.bookmark} />
      )}
    </div>
  );
}

function FolderContent({ label }: { label: string }) {
  return (
    <>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded">
        <svg className="h-10 w-10 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-medium text-white">{label}</span>
        <p className="text-xs text-zinc-500">Carpeta</p>
      </div>
    </>
  );
}

function LinkContent({ bookmark }: { bookmark: Bookmark }) {
  const favicon = getFavicon(bookmark.url);
  const hostname = (() => {
    try {
      return new URL(bookmark.url).hostname.replace(/^www\./, "");
    } catch {
      return bookmark.url;
    }
  })();

  return (
    <>
      {favicon ? (
        <img
          src={favicon}
          alt=""
          className="h-8 w-8 flex-shrink-0 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-zinc-700">
          <svg className="h-5 w-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z" />
          </svg>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="font-medium text-white">{bookmark.title}</span>
        <p className="truncate text-xs text-zinc-500">{hostname}</p>
      </div>
    </>
  );
}
