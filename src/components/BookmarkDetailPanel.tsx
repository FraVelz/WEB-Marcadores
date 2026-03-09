"use client";

import { useState, useRef, useEffect } from "react";
import TagAutocomplete from "./TagAutocomplete";

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

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}

function getFolderPath(folders: Folder[], folderId: string | null): string {
  if (!folderId) return "Raíz";
  const path: string[] = [];
  let current = folders.find((f) => f.id === folderId);
  while (current) {
    path.unshift(current.name);
    current = current.parent_id ? folders.find((f) => f.id === current!.parent_id) : undefined;
  }
  return path.join(" › ") || "Raíz";
}

function buildFolderOptions(folders: Folder[]): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  const add = (parentId: string | null, prefix: string) => {
    const children = folders.filter((f) => (f.parent_id || null) === parentId).sort((a, b) => a.sort_order - b.sort_order);
    for (const f of children) {
      const label = prefix ? `${prefix} › ${f.name}` : f.name;
      result.push({ id: f.id, label });
      add(f.id, label);
    }
  };
  add(null, "");
  return result;
}

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
  const currentFolderPath = getFolderPath(folders, bookmark.folder_id || null);

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
          <button onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-700 hover:text-white" aria-label="Cerrar">
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
              <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="mt-1 block truncate text-xs text-blue-400 hover:underline">
                {bookmark.url}
              </a>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-500">Carpeta actual</label>
            <p className="text-sm text-zinc-300">{currentFolderPath}</p>
            {folderOptions.length > 0 && (
              <div className="mt-2 flex gap-2">
                <select
                  value={moveFolderId}
                  onChange={(e) => setMoveFolderId(e.target.value)}
                  className="flex-1 rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Raíz</option>
                  {folderOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleMoveFolder}
                  disabled={saving || moveFolderId === (bookmark.folder_id || "")}
                  className="rounded bg-zinc-700 px-2 py-1 text-xs text-white hover:bg-zinc-600 disabled:opacity-50"
                >
                  Mover
                </button>
              </div>
            )}
          </div>

          {bookmark.description && (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Descripción</label>
              <p className="text-sm text-zinc-300">{bookmark.description}</p>
            </div>
          )}

          {created && <p className="text-xs text-zinc-500">Añadido: {created}</p>}

          <div>
            <label className="mb-2 block text-xs text-zinc-500">Tags</label>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span key={tag} className="group inline-flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)} disabled={saving} className="rounded hover:bg-zinc-600 hover:text-white disabled:opacity-50" aria-label={`Quitar ${tag}`}>
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2">
              <TagAutocomplete
                value={newTag}
                onChange={setNewTag}
                options={allTags.filter((t) => !tags.includes(t))}
                onSelectTag={(tag) => handleAddTag(tag)}
                onEnter={() => newTag.trim() && handleAddTag(newTag)}
                placeholder="Añadir tag..."
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2 border-t border-zinc-800 pt-4">
          <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
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
