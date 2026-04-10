"use client"

import type { BreadcrumbPart } from "../types"

type Props = {
  breadcrumb: BreadcrumbPart[]
  onSelect: (id: string | null) => void
}

export default function MarcadoresBreadcrumb({ breadcrumb, onSelect }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-zinc-700 bg-[#252526] px-3 py-1.5">
      {breadcrumb.map((part, i) => (
        <span key={part.id ?? "root"} className="flex items-center gap-1">
          {i > 0 && <span className="text-zinc-600">›</span>}
          <button
            type="button"
            onClick={() => onSelect(part.id)}
            className="rounded px-1.5 py-0.5 text-sm text-zinc-300 hover:bg-zinc-600 hover:text-white"
          >
            {part.label}
          </button>
        </span>
      ))}
    </div>
  )
}
