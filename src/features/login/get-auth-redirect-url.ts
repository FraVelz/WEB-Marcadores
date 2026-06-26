const DEFAULT_SITE_URL = "https://web-marcadores.vercel.app"

/** URL base para redirects de confirmación de email (cliente). */
export function getAuthRedirectUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? DEFAULT_SITE_URL
}
