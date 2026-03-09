"use client";

import { useState, useRef, useEffect } from "react";
import { buildFolderOptions, getFaviconUrl, getFolderPathLabel } from "@/lib/bookmark-utils";
import BookmarkDetailFolderSection from "./bookmark/BookmarkDetailFolderSection";
import BookmarkDetailTagsSection from "./bookmark/BookmarkDetailTagsSection";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  folder_id?: string | null;
  tags?: string[];
  created_at?: string;
};

type Folder = { id: string; parent_id: string | null; name: string; sort_order: number };

type Props = {
  bookmark: Bookmark | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  allTags: string[];
  folders: Folder[];
  embedded?: boolean;
};

export default function BookmarkDetailPanel({
  bookmark,
  onClose,
  onUpdate,
  allTags,
  folders,
  embedded = false,
}: Props) {
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [moveFolderId, setMoveFolderId] = useState<string>("");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (bookmark) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [bookmark, onClose]);

  useEffect(() => {
    if (bookmark) setMoveFolderId(bookmark.folder_id || "");
  }, [bookmark?.folder_id]);

  if (!bookmark) return null;

  const tags = bookmark.tags || [];
  const favicon = getFaviconUrl(bookmark.url);
  const created = bookmark.created_at
    ? new Date(bookmark.created_at).toLocaleDateString("es", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const folderOptions = buildFolderOptions(folders);
  const currentFolderPath = getFolderPathLabel(folders, bookmark.folder_id || null);

  const handleAddTag = async (tag: string) => {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    setSaving(true);
    await onUpdate(bookmark.id, { tags: [...tags, t] });
    setSaving(false);
    setNewTag("");
  };

  const handleRemoveTag = async (tag: string) => {
    setSaving(true);
    await onUpdate(bookmark.id, { tags: tags.filter((t) => t !== tag) });
    setSaving(false);
  };

  const handleMoveFolder = async () => {
    const targetId = moveFolderId || null;
    if (targetId === (bookmark.folder_id || null)) return;
    setSaving(true);
    await onUpdate(bookmark.id, { folder_id: targetId });
    setSaving(false);
  };

  const panelContent = (
    <div
      ref={panelRef}
      role={embedded ? undefined : "dialog"}
      aria-modal={embedded ? undefined : "true"}
      aria-label={embedded ? undefined : "Detalle del marcador"}
      data-no-vim
      onKeyDown={(e) => e.stopPropagation()}
      className={
        embedded
          ? "flex h-full min-w-[280px] max-w-[320px] flex-col border-l border-zinc-700 bg-[#252526]"
          : "fixed right-0 top-0 z-50 h-full w-80 border-l border-zinc-800 bg-zinc-900 shadow-xl"
      }
    >
      <div className="flex h-full flex-col p-4">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-700 pb-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {embedded ? "Propiedades" : "Detalle"}
          </h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-white"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
          <div className="flex items-start gap-3">
            {favicon && (
              <img
                src={favicon}
                alt=""
                className="h-10 w-10 flex-shrink-0 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-white">{bookmark.title}</h2>
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-xs text-blue-400 hover:underline"
              >
                {bookmark.url}
              </a>
            </div>
          </div>

          <BookmarkDetailFolderSection
            currentFolderPath={currentFolderPath}
            folderOptions={folderOptions}
            moveFolderId={moveFolderId}
            onMoveFolderIdChange={setMoveFolderId}
            onMove={handleMoveFolder}
            saving={saving}
            bookmarkFolderId={bookmark.folder_id || null}
          />

          {bookmark.description && (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Descripción</label>
              <p className="text-sm text-zinc-300">{bookmark.description}</p>
            </div>
          )}

          {created && <p className="text-xs text-zinc-500">Añadido: {created}</p>}

          <BookmarkDetailTagsSection
            tags={tags}
            newTag={newTag}
            onNewTagChange={setNewTag}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag}
            allTags={allTags}
            saving={saving}
          />
        </div>

        <div className="mt-4 flex gap-2 border-t border-zinc-800 pt-4">
          <a
            href={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
          >
            Abrir
          </a>
        </div>
      </div>
    </div>
  );

  if (embedded) return panelContent;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} aria-hidden />
      {panelContent}
    </>
  );
}
