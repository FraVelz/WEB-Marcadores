"use client"

import { useCallback, useEffect, useRef, useState } from "react"

type Args = {
  query: string
  onQueryChange: (value: string) => void
  delayMs?: number
}

export function useDebouncedSearchInput({ query, onQueryChange, delayMs = 250 }: Args) {
  const [draft, setDraftState] = useState(query)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setDraftState(query)
  }, [query])

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    onQueryChange(draft)
  }, [draft, onQueryChange])

  const setDraft = useCallback(
    (value: string) => {
      setDraftState(value)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        onQueryChange(value)
        timerRef.current = null
      }, delayMs)
    },
    [delayMs, onQueryChange]
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { draft, setDraft, flush }
}
