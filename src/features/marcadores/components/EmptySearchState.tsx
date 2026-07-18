"use client"

type Props = {
  query: string
}

export function EmptySearchState({ query }: Props) {
  const trimmed = query.trim()

  return (
    <output className="text-app-fg-label flex flex-col items-center justify-center py-16">
      <svg className="text-app-empty-icon mb-4 size-16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
      <p className="text-sm">
        Sin resultados para <span className="font-medium">«{trimmed}»</span>
      </p>
      <p className="text-app-fg-muted mt-1 max-w-sm text-center text-xs">
        Prueba otro término o ajusta los filtros de búsqueda.
      </p>
    </output>
  )
}
