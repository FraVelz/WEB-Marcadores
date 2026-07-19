"use client"

import { useState, useRef } from "react"
import { buildFolderOptions } from "@/lib/bookmark-utils"
import { useFocusTrap } from "@/hooks/useFocusTrap"
import { FOCUS_RING } from "@/lib/focusStyles"
import { cn } from "@/lib/utils"
import { splitCommaTags } from "@/lib/comma-tags"
import { BOOKMARK_URL_ERROR, isHttpUrl } from "@/lib/isHttpUrl"
import BookmarkFormBasicInfo from "./BookmarkFormBasicInfo"
import BookmarkFormFolderSelect from "./BookmarkFormFolderSelect"
import BookmarkFormTagsSection from "./BookmarkFormTagsSection"
import { useHotkeys } from "@/lib/hotkeys/useHotkeys"

export type BookmarkFormData = {
  title: string
  url: string
  description: string
  folder_id: string
  tags: string
  /** JSON object string for extension metadata */
  metadata: string
}

type Folder = { id: string; parent_id: string | null; name: string; sort_order: number }

type Props = {
  onClose: () => void
  onSubmit: (data: BookmarkFormData) => void | Promise<void>
  initialData?: Partial<BookmarkFormData> | null
  allTags: string[]
  folders: Folder[]
  currentFolderId: string | null
}

const emptyForm: BookmarkFormData = {
  title: "",
  url: "",
  description: "",
  folder_id: "",
  tags: "",
  metadata: "{}",
}

export default function BookmarkModal({ onClose, onSubmit, initialData, allTags, folders, currentFolderId }: Props) {
  const merged = {
    ...emptyForm,
    folder_id: currentFolderId || "",
    ...initialData,
  }
  const [tagsValue, setTagsValue] = useState(merged.tags)
  const [folderId, setFolderId] = useState(merged.folder_id)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [urlError, setUrlError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<string>("")

  useHotkeys("esc", () => onClose(), {}, [onClose])
  useFocusTrap(modalContentRef, { initialFocusRef: firstInputRef })

  const folderOptions = buildFolderOptions(folders)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setUrlError(null)
    setSubmitting(true)
    const form = e.currentTarget
    const trimmedPending = tagInputRef.current?.trim() ?? ""
    const finalTags = trimmedPending ? [...splitCommaTags(tagsValue), trimmedPending].join(", ") : tagsValue
    const url = (form.elements.namedItem("url") as HTMLInputElement).value
    const formData: BookmarkFormData = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      url,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      folder_id: folderId || "",
      tags: finalTags,
      metadata: (form.elements.namedItem("metadata") as HTMLTextAreaElement).value,
    }

    if (!isHttpUrl(url)) {
      setUrlError(BOOKMARK_URL_ERROR)
      setSubmitting(false)
      return
    }

    try {
      await onSubmit(formData)
      onClose()
      return
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al guardar"
      if (message === BOOKMARK_URL_ERROR) {
        setUrlError(message)
      } else {
        setSubmitError(message)
      }
    }
    setSubmitting(false)
  }

  return (
    <div
      className="bg-app-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      data-no-vim
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 cursor-default border-none bg-transparent p-0"
        aria-label="Cerrar modal"
        onClick={onClose}
      />
      <div
        ref={modalContentRef}
        className={cn(
          "relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl",
          "border-app-border bg-app-raised border p-6 shadow-xl"
        )}
      >
        <h2 id="modal-title" className="text-app-fg mb-4 text-xl font-semibold">
          {initialData ? "Editar marcador" : "Agregar marcador"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BookmarkFormBasicInfo
            title={merged.title}
            url={merged.url}
            description={merged.description}
            firstInputRef={firstInputRef}
            urlError={urlError}
          />
          <BookmarkFormFolderSelect folderId={folderId} folderOptions={folderOptions} onChange={setFolderId} />
          <BookmarkFormTagsSection
            value={tagsValue}
            onChange={setTagsValue}
            options={allTags}
            tagInputRef={tagInputRef}
          />
          <div>
            <label htmlFor="bookmark-metadata" className="text-app-fg-label mb-1 block text-sm font-medium">
              Metadata (JSON)
            </label>
            <textarea
              id="bookmark-metadata"
              name="metadata"
              rows={3}
              defaultValue={merged.metadata || "{}"}
              spellCheck={false}
              className={cn(
                "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2 font-mono text-xs",
                "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
              )}
              placeholder="{}"
            />
          </div>
          {submitError && (
            <p
              className={cn(
                "border-app-danger-border bg-app-danger-surface text-app-danger-fg rounded-lg border px-3 py-2",
                "text-sm"
              )}
            >
              {submitError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={cn(
                "border-app-input-border text-app-fg-secondary rounded-lg border px-4 py-2",
                FOCUS_RING,
                "hover:bg-app-raised-muted disabled:opacity-50"
              )}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                "bg-app-primary rounded-lg px-4 py-2 font-medium text-white disabled:opacity-50",
                FOCUS_RING,
                "hover:bg-app-primary-hover"
              )}
            >
              {submitting ? "Guardando…" : initialData ? "Guardar" : "Agregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
