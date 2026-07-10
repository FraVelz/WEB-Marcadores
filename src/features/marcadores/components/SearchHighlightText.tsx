"use client"

import { splitTextByQuery } from "@/features/marcadores/utils/splitTextByQuery"

type Props = {
  text: string
  query: string
  className?: string
}

export function SearchHighlightText({ text, query, className }: Props) {
  const segments = splitTextByQuery(text, query)
  const keyedSegments = segments.map((seg, index) => ({
    ...seg,
    key: `${segments.slice(0, index).reduce((sum, current) => sum + current.text.length, 0)}:${seg.text}`,
  }))

  return (
    <span className={className}>
      {keyedSegments.map((seg) => {
        return seg.highlight ? (
          <mark key={seg.key} className="bg-app-search-highlight rounded-sm px-0.5">
            {seg.text}
          </mark>
        ) : (
          <span key={seg.key}>{seg.text}</span>
        )
      })}
    </span>
  )
}
