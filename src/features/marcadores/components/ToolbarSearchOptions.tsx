"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { FOCUS_RING_ICON_BTN } from "@/lib/focusStyles"

type FilterProps = {
  searchInSubfolders: boolean
  setSearchInSubfolders: (value: boolean) => void
  searchInDescription: boolean
  setSearchInDescription: (value: boolean) => void
}

function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
    </svg>
  )
}

function hasActiveFilters(searchInSubfolders: boolean, searchInDescription: boolean) {
  return searchInSubfolders || !searchInDescription
}

function SearchFilterOptionsPanel({
  searchInSubfolders,
  setSearchInSubfolders,
  searchInDescription,
  setSearchInDescription,
}: FilterProps) {
  const subfoldersId = useId()
  const descriptionId = useId()

  return (
    <div className="flex flex-col gap-3 p-1">
      <label htmlFor={subfoldersId} className="text-app-fg-secondary flex cursor-pointer items-start gap-2.5 text-xs">
        <input
          id={subfoldersId}
          type="checkbox"
          className="border-app-input-border bg-app-raised-muted accent-app-primary mt-0.5 size-3.5 shrink-0 rounded"
          checked={searchInSubfolders}
          onChange={(e) => setSearchInSubfolders(e.target.checked)}
        />
        <span>
          <span className="text-app-fg font-medium">Buscar en subcarpetas</span>
          <span className="text-app-fg-muted mt-0.5 block text-[11px] leading-snug font-normal">
            Incluye carpetas hijas; en la raíz busca en toda la biblioteca.
          </span>
        </span>
      </label>

      <label htmlFor={descriptionId} className="text-app-fg-secondary flex cursor-pointer items-center gap-2.5 text-xs">
        <input
          id={descriptionId}
          type="checkbox"
          className="border-app-input-border bg-app-raised-muted accent-app-primary size-3.5 shrink-0 rounded"
          checked={searchInDescription}
          onChange={(e) => setSearchInDescription(e.target.checked)}
        />
        <span className="text-app-fg font-medium">Buscar en descripción</span>
      </label>
    </div>
  )
}

type FilterMenuProps = FilterProps & {
  variant?: "pill" | "compact"
}

export function ToolbarSearchFilterMenu({
  searchInSubfolders,
  setSearchInSubfolders,
  searchInDescription,
  setSearchInDescription,
  variant = "pill",
}: FilterMenuProps) {
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState<{ top: number; left: number; width: number } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const active = hasActiveFilters(searchInSubfolders, searchInDescription)

  useEffect(() => {
    if (!open) return

    const updatePosition = () => {
      const button = buttonRef.current
      if (!button) return

      const rect = button.getBoundingClientRect()
      const width = variant === "compact" ? 240 : 256
      const left = Math.min(Math.max(8, rect.right - width), window.innerWidth - width - 8)

      setPanelStyle({
        top: rect.bottom + 6,
        left,
        width,
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [open, variant])

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return
      setOpen(false)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("mousedown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("mousedown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="Opciones de búsqueda"
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Filtros de búsqueda"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "relative rounded-md transition-colors",
          FOCUS_RING_ICON_BTN,
          variant === "pill"
            ? "text-app-fg-muted hover:text-app-fg hover:bg-app-hover p-1.5"
            : "text-app-fg-muted hover:text-app-fg hover:bg-app-hover p-1",
          open && "text-app-fg bg-app-hover"
        )}
      >
        <FilterIcon className={variant === "pill" ? "size-4" : "size-3.5"} />
        {active ? <span className="bg-app-accent absolute top-1 right-1 size-1.5 rounded-full" aria-hidden /> : null}
      </button>

      {open && panelStyle
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Filtros de búsqueda"
              className="border-app-input-border bg-app-raised-muted fixed z-[60000] rounded-lg border p-3 shadow-lg"
              style={{ top: panelStyle.top, left: panelStyle.left, width: panelStyle.width }}
            >
              <SearchFilterOptionsPanel
                searchInSubfolders={searchInSubfolders}
                setSearchInSubfolders={setSearchInSubfolders}
                searchInDescription={searchInDescription}
                setSearchInDescription={setSearchInDescription}
              />
            </div>,
            document.body
          )
        : null}
    </div>
  )
}

type ChipsProps = {
  hasQuery: boolean
  searchInSubfolders: boolean
  searchInDescription: boolean
  className?: string
}

export function ToolbarSearchFilterChips({ hasQuery, searchInSubfolders, searchInDescription, className }: ChipsProps) {
  if (!hasQuery) return null

  const labels: string[] = []
  if (searchInSubfolders) labels.push("Subcarpetas")
  if (searchInDescription) labels.push("Descripción")
  if (labels.length === 0) return null

  return (
    <p className={cn("text-app-fg-muted flex flex-wrap items-center gap-1 px-1 pt-1.5 text-[11px]", className)}>
      {labels.map((label, index) => (
        <span key={label} className="inline-flex items-center gap-1">
          {index > 0 ? <span aria-hidden>·</span> : null}
          <span className="bg-app-raised-muted text-app-fg-secondary rounded-full px-2 py-0.5">{label}</span>
        </span>
      ))}
    </p>
  )
}
