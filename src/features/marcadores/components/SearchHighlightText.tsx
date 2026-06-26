"use client"

import { splitTextByQuery } from "@/features/marcadores/utils/splitTextByQuery"

type Props = {
  text: string
  query: string
  className?: string
}

export function SearchHighlightText({ text, query, className }: Props) {
  const segments = splitTextByQuery(text, query)

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.highlight ? (
          <mark key={i} className="bg-app-search-highlight rounded-sm px-0.5">
            {seg.text}
          </mark>
        ) : (
          <span key={i}>{seg.text}</span>
        )
      )}
    </span>
  )
}
