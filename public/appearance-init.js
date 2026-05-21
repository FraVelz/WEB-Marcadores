/**
 * Arranque mínimo antes de la hidratación.
 * El servidor ya aplica tema (light/dark), paleta, selección y cristal en <html>.
 * Aquí solo: migración legacy, corrección de tema «system» y tapiz (localStorage).
 * Constantes alineadas con src/lib/appAppearanceCookies.ts
 */
;(function () {
  const COOKIE_NAME = "marcadores_app_appearance_v1"
  const WALLPAPER_KEY = "marcadores_app_wallpaper_v1"
  const LEGACY_LS_KEY = COOKIE_NAME
  const DEFAULT_VEIL = 0.72
  const FALLBACK_CANVAS_RGB = [24, 24, 27]

  function getCookie(name) {
    const prefix = `${name}=`
    for (const part of document.cookie.split(";")) {
      const trimmed = part.trim()
      if (trimmed.startsWith(prefix)) {
        return decodeURIComponent(trimmed.slice(prefix.length))
      }
    }
    return null
  }

  function parseJson(raw) {
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  function migrateLegacy() {
    if (getCookie(COOKIE_NAME)) return

    let raw = null
    try {
      raw = localStorage.getItem(LEGACY_LS_KEY)
    } catch {
      return
    }
    if (!raw) return

    const legacy = parseJson(raw)
    if (!legacy || typeof legacy !== "object") return

    try {
      const payload = {}

      for (const key of Object.keys(legacy)) {
        if (key !== "wallpaperDataUrl") payload[key] = legacy[key]
      }

      const encoded = encodeURIComponent(JSON.stringify(payload))
      if (encoded.length <= 3800) {
        document.cookie = `${COOKIE_NAME}=${encoded};path=/;max-age=31536000;SameSite=Lax`
      }

      if (legacy.wallpaperDataUrl) {
        localStorage.setItem(
          WALLPAPER_KEY,
          JSON.stringify({
            wallpaperDataUrl: legacy.wallpaperDataUrl,
            wallpaperVeil:
              typeof legacy.wallpaperVeil === "number" ? legacy.wallpaperVeil : DEFAULT_VEIL,
          })
        )
      }
      localStorage.removeItem(LEGACY_LS_KEY)

    } catch {
      /* quota u otro */
    }
  }

  function readThemeFromCookie() {
    migrateLegacy()
    const data = parseJson(getCookie(COOKIE_NAME))
    if (!data || typeof data !== "object") return "dark"
    const theme = data.theme
    return theme === "light" || theme === "dark" || theme === "system" ? theme : "dark"
  }

  /** Solo «system»: el servidor no siempre conoce prefers-color-scheme. */
  function applySystemTheme(theme) {
    if (theme !== "system") return
    const root = document.documentElement
    const dark = window.matchMedia("(prefers-color-scheme: dark)").matches
    root.classList.toggle("dark", dark)
  }

  function canvasRgbTriplet() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--app-canvas").trim()
    const match = raw.match(/^#?([0-9a-f]{6})$/i)

    if (!match) return FALLBACK_CANVAS_RGB

    const n = Number.parseInt(match[1], 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  }

  function applyWallpaper() {
    let raw = null

    try {
      raw = localStorage.getItem(WALLPAPER_KEY)
    } catch {
      return
    }

    const stored = parseJson(raw)
    if (
      !stored ||
      typeof stored.wallpaperDataUrl !== "string" ||
      !stored.wallpaperDataUrl.startsWith("data:image/")
    ) {
      return
    }

    const body = document.body
    if (!body) return

    const veil =
      typeof stored.wallpaperVeil === "number" && Number.isFinite(stored.wallpaperVeil)
        ? Math.min(1, Math.max(0, stored.wallpaperVeil))
        : DEFAULT_VEIL
    const [r, g, b] = canvasRgbTriplet()
    const alpha = Math.min(0.98, Math.max(0, veil))

    body.style.backgroundColor = "transparent"
    body.style.backgroundImage = `linear-gradient(rgba(${r},${g},${b},${alpha}),rgba(${r},${g},${b},${alpha})),url(${stored.wallpaperDataUrl})`
    body.style.backgroundSize = "cover,cover"
    body.style.backgroundAttachment = "fixed"
    body.style.backgroundRepeat = "no-repeat"
  }

  try {
    const theme = readThemeFromCookie()
    applySystemTheme(theme)
    applyWallpaper()

  } catch {
    /* no bloquear la carga */
  }
})()
