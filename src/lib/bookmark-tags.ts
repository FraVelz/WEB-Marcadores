/** Etiquetas únicas ordenadas a partir de filas que tienen array `tags` (ej. marcadores Supabase). */
export function sortedUniqueTagsFromRows(rows: { tags?: string[] | null }[]): string[] {
  const tags = new Set<string>()

  for (const row of rows) {
    for (const t of row.tags || []) {
      if (t?.trim()) tags.add(t.trim())
    }
  }

  return Array.from(tags).sort()
}
