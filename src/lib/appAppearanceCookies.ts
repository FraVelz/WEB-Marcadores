const APP_APPEARANCE_COOKIE_NAME = "marcadores_app_appearance_v1"

/** Clave legacy en localStorage; se migra una vez a la cookie. */
export const APP_APPEARANCE_STORAGE_KEY = APP_APPEARANCE_COOKIE_NAME

export const APP_APPEARANCE_WALLPAPER_STORAGE_KEY = "marcadores_app_wallpaper_v1"

const COOKIE_MAX_AGE_SEC = 60 * 60 * 24 * 365

export function parseAppearanceCookieJson(raw: string | undefined | null): unknown {
  if (!raw) return null
  try {
    const decoded = decodeURIComponent(raw)
    return JSON.parse(decoded) as unknown
  } catch {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return null
    }
  }
}

type CookieReader = {
  get(name: string): { value: string } | undefined
}

export function readAppearanceCookieValueFromStore(store: CookieReader): string | null {
  return store.get(APP_APPEARANCE_COOKIE_NAME)?.value ?? null
}

function serializeAppearanceCookieValue(payload: unknown): string {
  return encodeURIComponent(JSON.stringify(payload))
}

/** Cliente: valor crudo de la cookie de apariencia. */
export function readAppearanceCookieValueClient(): string | null {
  if (typeof document === "undefined") return null
  const prefix = `${APP_APPEARANCE_COOKIE_NAME}=`
  const parts = document.cookie.split(";")
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length)
    }
  }
  return null
}

/** Cliente: persiste JSON en cookie (sin tapiz). */
export function writeAppearanceCookieClient(payload: unknown): void {
  if (typeof document === "undefined") return
  const value = serializeAppearanceCookieValue(payload)
  if (value.length > 3800) return
  document.cookie = `${APP_APPEARANCE_COOKIE_NAME}=${value};path=/;max-age=${COOKIE_MAX_AGE_SEC};SameSite=Lax`
}
