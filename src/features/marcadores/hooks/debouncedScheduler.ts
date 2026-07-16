/**
 * Debounce scheduler with generation-based stale cancellation.
 * Used by useDebouncedSearchInput; tested in isolation (no DOM).
 */
export function createDebouncedScheduler(delayMs: number, onFire: (value: string) => void) {
  let timer: ReturnType<typeof setTimeout> | null = null
  let generation = 0

  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  return {
    schedule(value: string) {
      clear()
      const gen = ++generation
      timer = setTimeout(() => {
        timer = null
        if (gen !== generation) return
        onFire(value)
      }, delayMs)
    },
    flush(value: string) {
      clear()
      generation += 1
      onFire(value)
    },
    cancel() {
      clear()
      generation += 1
    },
  }
}
