/** Separa una cadena tipo "a, b, c" en etiquetas sin `map().filter(Boolean)`. */
export function splitCommaTags(input: string): string[] {
  return input.split(",").flatMap((t) => {
    const v = t.trim()
    return v ? [v] : []
  })
}
