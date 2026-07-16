/** Client-side import rate limit (C3-3). Import runs via Supabase client, not a server action. */

export const IMPORT_RATE_WINDOW_MS = 10 * 60 * 1000
export const IMPORT_RATE_MAX = 5
export const IMPORT_MAX_ITEMS = 5_000

export const IMPORT_RATE_LIMIT_MESSAGE =
  "Demasiadas importaciones en poco tiempo. Espera unos minutos e inténtalo de nuevo."

export const IMPORT_MAX_ITEMS_MESSAGE = `La importación supera el límite de ${IMPORT_MAX_ITEMS} elementos`

export type ImportRateStore = {
  timestamps: number[]
}

export function createImportRateStore(timestamps: number[] = []): ImportRateStore {
  return { timestamps: [...timestamps] }
}

/**
 * Throws if more than IMPORT_RATE_MAX successful/attempted imports fall inside the window.
 * Call before starting parse/persist; on success call `recordImportAttempt`.
 */
export function assertImportRateLimit(store: ImportRateStore, now = Date.now()): void {
  const cutoff = now - IMPORT_RATE_WINDOW_MS
  store.timestamps = store.timestamps.filter((t) => t > cutoff)
  if (store.timestamps.length >= IMPORT_RATE_MAX) {
    throw new Error(IMPORT_RATE_LIMIT_MESSAGE)
  }
}

export function recordImportAttempt(store: ImportRateStore, now = Date.now()): void {
  const cutoff = now - IMPORT_RATE_WINDOW_MS
  store.timestamps = store.timestamps.filter((t) => t > cutoff)
  store.timestamps.push(now)
}

export function assertImportItemCount(itemCount: number): void {
  if (itemCount > IMPORT_MAX_ITEMS) {
    throw new Error(IMPORT_MAX_ITEMS_MESSAGE)
  }
}

/** Process-lifetime store for browser sessions (module singleton). */
let memoryStore: ImportRateStore | null = null

export function getDefaultImportRateStore(): ImportRateStore {
  if (!memoryStore) memoryStore = createImportRateStore()
  return memoryStore
}

/** Test helper — reset singleton. */
export function resetDefaultImportRateStore(): void {
  memoryStore = createImportRateStore()
}
