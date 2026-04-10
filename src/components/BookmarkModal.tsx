"use client"

import { useEffect, useState, useRef } from "react"
import { buildFolderOptions } from "@/lib/bookmark-utils"
import { cn } from "@/lib/utils"
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
  isOpen: boolean
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

export default function BookmarkModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  allTags,
  folders,
  currentFolderId,
}: Props) {
  const data = { ...emptyForm, folder_id: currentFolderId || "", ...initialData }
  const [tagsValue, setTagsValue] = useState(data.tags)
  const [folderId, setFolderId] = useState(data.folder_id)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)
  const modalContentRef = useRef<HTMLDivElement>(null)
  const tagInputRef = useRef<string>("")

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [isOpen, onClose])

  useEffect(() => {
    if (isOpen) {
      setTagsValue(initialData?.tags ?? data.tags)
      setFolderId(initialData?.folder_id ?? currentFolderId ?? "")
      setSubmitError(null)
      tagInputRef.current = ""
      requestAnimationFrame(() => firstInputRef.current?.focus())
    }
  }, [isOpen, initialData?.tags, initialData?.folder_id, currentFolderId, data.tags])

  useEffect(() => {
    if (!isOpen || !modalContentRef.current) return
    const el = modalContentRef.current
    const focusables = el.querySelectorAll<HTMLElement>(
      'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [isOpen])

  if (!isOpen) return null

  const folderOptions = buildFolderOptions(folders)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    const form = e.currentTarget
    const pendingTag = tagInputRef.current?.trim()
    const finalTags = pendingTag
      ? [
          ...tagsValue
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          pendingTag,
        ].join(", ")
      : tagsValue
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
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSubmitting(false)
    }
  }

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
        className={cn(
          "relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl",
          "border border-zinc-700 bg-zinc-900 p-6 shadow-xl"
        )}
      >
        <h2 id="modal-title" className="mb-4 text-xl font-bold text-white">
          {initialData ? "Editar marcador" : "Agregar marcador"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <BookmarkFormBasicInfo
            title={data.title}
            url={data.url}
            description={data.description}
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
            <p className="rounded-lg border border-red-600/50 bg-red-900/20 px-3 py-2 text-sm text-red-400">
              {submitError}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={cn(
                "rounded-lg border border-zinc-600 px-4 py-2 text-zinc-300",
                "hover:bg-zinc-800 disabled:opacity-50"
              )}
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
  )
}
