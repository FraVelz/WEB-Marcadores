"use client"

import { useEffect, useRef, useState } from "react"

type Args = {
  query: string
  onQueryChange: (value: string) => void
  delayMs?: number
}

export function useDebouncedSearchInput({ query, onQueryChange, delayMs = 250 }: Args) {
  const [draftState, setDraftState] = useState({ query, draft: query })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const draft = draftState.query === query ? draftState.draft : query

  const flush = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    onQueryChange(draft)
  }

  const setDraft = (value: string) => {
    setDraftState({ query, draft: value })
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onQueryChange(value)
      timerRef.current = null
    }, delayMs)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { draft, setDraft, flush }
}
