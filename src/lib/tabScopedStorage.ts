/**
 * `localStorage` es compartido entre pestañas; fijamos un id por pestaña en
 * `sessionStorage` y prefijamos las claves para que el estado UI sea independiente.
 */

const TAB_SCOPE_SESSION_KEY = "marcadores_tab_scope_v1"

/** Mismo valor que usa `appearance-init.js` si `sessionStorage` falla. */
const TAB_SCOPE_FALLBACK_ID = "__no_session__"

const SSR_SENTINEL = "__ssr__"

function getTabScopeId(): string {
  if (typeof window === "undefined") return SSR_SENTINEL
  try {
    let id = sessionStorage.getItem(TAB_SCOPE_SESSION_KEY)
    if (!id) {
      id = crypto.randomUUID()
      sessionStorage.setItem(TAB_SCOPE_SESSION_KEY, id)
    }
    return id
  } catch {
    return TAB_SCOPE_FALLBACK_ID
  }
}

function tabScopedStorageKey(baseKey: string): string {
  const scope = getTabScopeId()
  if (scope === SSR_SENTINEL) return baseKey
  return `${scope}::${baseKey}`
}

export function readTabScopedItem(baseKey: string): string | null {
  if (typeof window === "undefined") return null
  try {
    const scoped = tabScopedStorageKey(baseKey)
    let v = localStorage.getItem(scoped)
    if (v !== null) return v
    v = localStorage.getItem(baseKey)
    if (v !== null) {
      try {
        localStorage.setItem(scoped, v)
      } catch {
        /* ignore */
      }
    }
    return v
  } catch {
    return null
  }
}

export function writeTabScopedItem(baseKey: string, value: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(tabScopedStorageKey(baseKey), value)
  } catch {
    /* ignore */
  }
}
