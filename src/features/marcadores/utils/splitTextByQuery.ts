export type TextSegment = { text: string; highlight: boolean }

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/** Parte `text` por todas las ocurrencias de `query` (case-insensitive). */
export function splitTextByQuery(text: string, query: string): TextSegment[] {
  const q = query.trim()
  if (!q || !text) return [{ text, highlight: false }]

  const pattern = new RegExp(escapeRegExp(q), "gi")
  const segments: TextSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), highlight: false })
    }
    segments.push({ text: match[0], highlight: true })
    lastIndex = match.index + match[0].length
    if (match[0].length === 0) {
      pattern.lastIndex += 1
    }
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), highlight: false })
  }

  return segments.length > 0 ? segments : [{ text, highlight: false }]
}
