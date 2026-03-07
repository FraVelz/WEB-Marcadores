"use client";

import { useEffect } from "react";

export type BookmarkFormData = {
  title: string;
  url: string;
  description: string;
  notes: string;
  tags: string;
  favicon: string;
  color: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookmarkFormData) => void;
  initialData?: Partial<BookmarkFormData> | null;
  allTags: string[];
};

const emptyForm: BookmarkFormData = {
  title: "",
  url: "",
  description: "",
  notes: "",
  tags: "",
  favicon: "",
  color: "",
};

export default function BookmarkModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allTags,
}: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const data = { ...emptyForm, ...initialData };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    onSubmit({
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      url: (form.elements.namedItem("url") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value,
      tags: (form.elements.namedItem("tags") as HTMLInputElement).value,
      favicon: (form.elements.namedItem("favicon") as HTMLInputElement).value,
      color: (form.elements.namedItem("color") as HTMLInputElement).value,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-white">
          {initialData ? "Editar marcador" : "Agregar marcador"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Título *</label>
            <input
              name="title"
              defaultValue={data.title}
              required
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
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Descripción</label>
            <input
              name="description"
              defaultValue={data.description}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Notas</label>
            <textarea
              name="notes"
              defaultValue={data.notes}
              rows={3}
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-500">Tags (separados por coma)</label>
            <input
              name="tags"
              defaultValue={data.tags}
              list="modal-tag-suggestions"
              className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
            <datalist id="modal-tag-suggestions">
              {allTags.map((tag) => (
                <option key={tag} value={tag} />
              ))}
            </datalist>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Favicon (URL)</label>
              <input
                name="favicon"
                type="url"
                defaultValue={data.favicon}
                placeholder="https://..."
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Color (hex)</label>
              <input
                name="color"
                type="text"
                defaultValue={data.color}
                placeholder="#3b82f6"
                className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              {initialData ? "Guardar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
