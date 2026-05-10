"use client"

import type { BreadcrumbPart } from "../utils/types"

type Props = {
  breadcrumb: BreadcrumbPart[]
  onSelect: (id: string | null) => void
}

export default function MarcadoresBreadcrumb({ breadcrumb, onSelect }: Props) {
  return (
    <div className="border-app-border bg-app-sidebar flex min-w-0 shrink-0 flex-wrap items-center gap-1 overflow-x-auto border-b px-2 py-1.5">
      {breadcrumb.map((part, i) => (
        <span key={part.id ?? "root"} className="flex items-center gap-1">
          {i > 0 && <span className="text-app-fg-icon">›</span>}
          <button
            type="button"
            onClick={() => onSelect(part.id)}
            className="text-app-fg-secondary hover:bg-app-active hover:text-app-fg rounded px-1.5 py-0.5 text-sm"
          >
            {part.label}
          </button>
        </span>
      ))}
    </div>
  )
}
