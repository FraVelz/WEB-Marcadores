"use client"

import { useEffect, useState, useRef, useEffectEvent, useMemo } from "react"
import { buildFolderOptions } from "@/lib/bookmark-utils"
import { cn } from "@/lib/utils"
import { splitCommaTags } from "@/lib/comma-tags"
import BookmarkFormBasicInfo from "./bookmark/BookmarkFormBasicInfo"
import BookmarkFormFolderSelect from "./bookmark/BookmarkFormFolderSelect"
import BookmarkFormTagsSection from "./bookmark/BookmarkFormTagsSection"

export type BookmarkFormData = {
  title: string
  url: string
  description: string
  folder_id: string
  tags: string
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
}

export default function BookmarkModal({ onClose, onSubmit, initialData, allTags, folders, currentFolderId }: Props) {
  const merged = useMemo(
    () => ({
      ...emptyForm,
      folder_id: currentFolderId || "",
      ...initialData,
    }),
    [initialData, currentFolderId]
  )
  const [tagsValue, setTagsValue] = useState(merged.tags)
  const [folderId, setFolderId] = useState(merged.folder_id)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<string>("")

  const onCloseEvent = useEffectEvent(onClose)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseEvent()
    }
    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => firstInputRef.current?.focus())
  }, [])

  useEffect(() => {
    const el = modalContentRef.current
    if (!el) return
    const focusables = el.querySelectorAll<HTMLElement>(
      [
        "input:not([disabled]), textarea:not([disabled]), button:not([disabled]),",
        "select:not([disabled]), [tabindex]:not([tabindex='-1'])",
      ].join(" ")
    )
    const first = focusables[0]
    const last = focusables[focusables.length - 1]
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }
    el.addEventListener("keydown", handleKeyDown)
    return () => el.removeEventListener("keydown", handleKeyDown)
  }, [])

  const folderOptions = buildFolderOptions(folders)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    const form = e.currentTarget
    const trimmedPending = tagInputRef.current?.trim() ?? ""
    const finalTags = trimmedPending ? [...splitCommaTags(tagsValue), trimmedPending].join(", ") : tagsValue
    const formData: BookmarkFormData = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      url: (form.elements.namedItem("url") as HTMLInputElement).value,
      description: (form.elements.namedItem("description") as HTMLInputElement).value,
      folder_id: folderId || "",
      tags: finalTags,
    }
    try {
      await onSubmit(formData)
      onClose()
      return
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar")
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
          />
          <BookmarkFormFolderSelect folderId={folderId} folderOptions={folderOptions} onChange={setFolderId} />
          <BookmarkFormTagsSection
            value={tagsValue}
            onChange={setTagsValue}
            options={allTags}
            tagInputRef={tagInputRef}
          />
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
