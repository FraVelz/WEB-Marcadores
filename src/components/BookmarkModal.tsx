"use client";

import { useEffect, useState } from "react";
import TagAutocomplete from "./TagAutocomplete";

export type BookmarkFormData = {
  title: string;
  url: string;
  description: string;
  notes: string;
  theme: string;
  subtheme: string;
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
  allThemes: string[];
  allSubthemes: string[];
};

const emptyForm: BookmarkFormData = {
  title: "",
  url: "",
  description: "",
  notes: "",
  theme: "",
  subtheme: "",
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
  allThemes,
  allSubthemes,
}: Props) {
  const data = { ...emptyForm, ...initialData };
  const [tagsValue, setTagsValue] = useState(data.tags);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) setTagsValue(initialData?.tags ?? "");
  }, [isOpen, initialData?.tags]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    onSubmit({
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      url: (form.elements.namedItem("url") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      notes: (form.elements.namedItem("notes") as HTMLTextAreaElement).value,
      theme: (form.elements.namedItem("theme") as HTMLInputElement).value.trim(),
      subtheme: (form.elements.namedItem("subtheme") as HTMLInputElement).value.trim(),
      tags: tagsValue,
      favicon: (form.elements.namedItem("favicon") as HTMLInputElement).value,
      color: (form.elements.namedItem("color") as HTMLInputElement).value,
    });
    onClose();
  };

  const getFaviconFromUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      return "";
    }
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
          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Información básica</h3>
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
                onBlur={(e) => {
                  const faviconInput = e.currentTarget.form?.elements.namedItem("favicon") as HTMLInputElement;
                  if (faviconInput && !faviconInput.value && e.target.value) {
                    faviconInput.placeholder = getFaviconFromUrl(e.target.value);
                  }
                }}
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
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Clasificación</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Tema</label>
                <input
                  name="theme"
                  defaultValue={data.theme}
                  list="theme-list"
                  placeholder="Ej: Desarrollo, Herramientas"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
                <datalist id="theme-list">
                  {allThemes.map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Subtema</label>
                <input
                  name="subtheme"
                  defaultValue={data.subtheme}
                  list="subtheme-list"
                  placeholder="Ej: Frontend, Backend"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                />
                <datalist id="subtheme-list">
                  {allSubthemes.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Detalles</h3>
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
              <label className="mb-1 block text-xs text-zinc-500">Tags (selecciona o escribe y Enter para añadir)</label>
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

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-zinc-400">Apariencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Favicon (vacío = auto desde URL)</label>
                <input
                  name="favicon"
                  type="url"
                  defaultValue={data.favicon}
                  placeholder="Se obtiene del dominio si está vacío"
                  className="w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
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
          </section>
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
