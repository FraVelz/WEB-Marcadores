"use client";

import { useState, useRef, useEffect } from "react";
import TagAutocomplete from "./TagAutocomplete";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  theme?: string;
  subtheme?: string;
  tags?: string[];
  created_at?: string;
};

type Props = {
  bookmark: Bookmark | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Bookmark>) => Promise<void>;
  allTags: string[];
  allThemes: string[];
  allSubthemes: string[];
};

function getFaviconUrl(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return "";
  }
}

export default function BookmarkDetailPanel({
  bookmark,
  onClose,
  onUpdate,
  allTags,
  allThemes,
  allSubthemes,
}: Props) {
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (bookmark) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [bookmark, onClose]);

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

  const handleAddTag = async (tag: string) => {
    const t = tag.trim();
    if (!t || tags.includes(t)) return;
    setSaving(true);
    await onUpdate(bookmark.id, { tags: [...tags, t] });
    setSaving(false);
    setNewTag("");
  };

  const handleTagSelected = (tag: string) => {
    handleAddTag(tag);
  };

  const handleRemoveTag = async (tag: string) => {
    setSaving(true);
    await onUpdate(bookmark.id, {
      tags: tags.filter((t) => t !== tag),
    });
    setSaving(false);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Detalle del marcador"
        data-no-vim
        onKeyDown={(e) => e.stopPropagation()}
        className="fixed right-0 top-0 z-50 h-full w-80 border-l border-zinc-800 bg-zinc-900 shadow-xl"
      >
      <div className="flex h-full flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-400">Detalle</h3>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-white"
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

          {(bookmark.theme || bookmark.subtheme) && (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Clasificación</label>
              <p className="text-sm text-zinc-300">
                {[bookmark.theme, bookmark.subtheme].filter(Boolean).join(" › ")}
              </p>
            </div>
          )}

          {bookmark.description && (
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Descripción</label>
              <p className="text-sm text-zinc-300">{bookmark.description}</p>
            </div>
          )}

          {created && (
            <p className="text-xs text-zinc-500">Añadido: {created}</p>
          )}

          <div>
            <label className="mb-2 block text-xs text-zinc-500">Tags</label>
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="group inline-flex items-center gap-1 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    disabled={saving}
                    className="rounded hover:bg-zinc-600 hover:text-white disabled:opacity-50"
                    aria-label={`Quitar ${tag}`}
                  >
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
                onSelectTag={handleTagSelected}
                onEnter={() => newTag.trim() && handleAddTag(newTag)}
                placeholder="Añadir tag..."
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Escribe y Enter para añadir
              </p>
            </div>
          </div>
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
    </>
  );
}
