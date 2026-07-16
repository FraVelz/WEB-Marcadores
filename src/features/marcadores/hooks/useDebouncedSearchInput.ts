"use client"

import { useEffect, useRef, useState } from "react"

import { createDebouncedScheduler } from "./debouncedScheduler"

type Args = {
  query: string
  onQueryChange: (value: string) => void
  /** Debounce window; ticket C1-4 target 200–300ms. */
  delayMs?: number
}

/**
 * Debounced search draft. Cancels stale timers and ignores outdated flushes
 * when a newer keystroke supersedes them (generation token).
 */
export function useDebouncedSearchInput({ query, onQueryChange, delayMs = 250 }: Args) {
  const [draftState, setDraftState] = useState({ query, draft: query })
  const onQueryChangeRef = useRef(onQueryChange)
  const schedulerRef = useRef<ReturnType<typeof createDebouncedScheduler> | null>(null)

  useEffect(() => {
    onQueryChangeRef.current = onQueryChange
  }, [onQueryChange])

  useEffect(() => {
    const scheduler = createDebouncedScheduler(delayMs, (value) => {
      onQueryChangeRef.current(value)
    })
    schedulerRef.current = scheduler
    return () => {
      scheduler.cancel()
      schedulerRef.current = null
    }
  }, [delayMs])

  const draft = draftState.query === query ? draftState.draft : query

  const flush = () => {
    schedulerRef.current?.flush(draft)
  }

  const setDraft = (value: string) => {
    setDraftState({ query, draft: value })
    schedulerRef.current?.schedule(value)
  }

  return { draft, setDraft, flush }
}
