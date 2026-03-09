"use client";

import { useEffect, useState, useRef } from "react";
import TagAutocomplete from "./TagAutocomplete";

export type BookmarkFormData = {
  title: string;
  url: string;
  description: string;
  folder_id: string;
  tags: string;
};

type Folder = { id: string; parent_id: string | null; name: string; sort_order: number };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookmarkFormData) => void | Promise<void>;
  initialData?: Partial<BookmarkFormData> | null;
  allTags: string[];
  folders: Folder[];
  currentFolderId: string | null;
};

const emptyForm: BookmarkFormData = {
  title: "",
  url: "",
  description: "",
  folder_id: "",
  tags: "",
};

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

export default function BookmarkModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allTags,
  folders,
  currentFolderId,
}: Props) {
  const data = { ...emptyForm, folder_id: currentFolderId || "", ...initialData };
  const [tagsValue, setTagsValue] = useState(data.tags);
  const [folderId, setFolderId] = useState(data.folder_id);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTagsValue(initialData?.tags ?? data.tags);
      setFolderId(initialData?.folder_id ?? currentFolderId ?? "");
      setSubmitError(null);
      requestAnimationFrame(() => firstInputRef.current?.focus());
    }
  }, [isOpen, initialData?.tags, initialData?.folder_id, currentFolderId]);

  useEffect(() => {
    if (!isOpen || !modalContentRef.current) return;
    const el = modalContentRef.current;
    const focusables = el.querySelectorAll<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    el.addEventListener("keydown", handleKeyDown);
    return () => el.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const folderOptions = buildFolderOptions(folders);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const formData: BookmarkFormData = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      url: (form.elements.namedItem("url") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      folder_id: folderId || "",
      tags: tagsValue,
    };
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-no-vim
      onKeyDown={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        ref={modalContentRef}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
      >
        <h2 id="modal-title" className="mb-4 text-xl font-bold text-white">
          {initialData ? "Editar marcador" : "Agregar marcador"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Información básica</h3>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Título *</label>
              <input
                ref={firstInputRef}
                name="title"
                defaultValue={data.title}
                required
                autoComplete="off"
                data-no-vim
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">URL *</label>
              <input
                name="url"
                type="url"
                defaultValue={data.url}
                required
                data-no-vim
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Descripción</label>
              <input
                name="description"
                defaultValue={data.description}
                data-no-vim
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Carpeta</h3>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Ubicación</label>
              <select
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                data-no-vim
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="">Raíz (Marcadores)</option>
                {folderOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Tags</h3>
            <div>
              <TagAutocomplete
                value={tagsValue}
                onChange={setTagsValue}
                options={allTags}
                onSelectTag={(tag) => {
                  const current = tagsValue.split(",").map((t) => t.trim()).filter(Boolean);
                  if (!current.includes(tag)) setTagsValue([...current, tag].join(", "));
                }}
                placeholder="web, herramientas, ..."
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </section>

          {submitError && (
            <p className="rounded-lg border border-red-600/50 bg-red-900/20 px-3 py-2 text-sm text-red-400">
              {submitError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Guardando..." : initialData ? "Guardar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
