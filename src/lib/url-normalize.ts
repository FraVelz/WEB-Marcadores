/**
 * Dedupe/normalize URLs for clustering likely duplicates client-side only.
 */

const YOUTUBE_HOSTS = new Set(["youtube.com", "youtu.be", "m.youtube.com", "www.youtube.com", "music.youtube.com"])

function stripAmpPath(pathname: string): string {
  if (pathname.endsWith("/amp")) return pathname.slice(0, -4)
  if (pathname.includes("/amp/")) return pathname.replace(/\/amp\/?/, "/")
  return pathname
}

function extractYouTubeWatchId(hostname: string, pathname: string, searchParams: URLSearchParams): string | null {
  const h = hostname.replace(/^www\./, "").toLowerCase()
  if (h === "youtu.be") {
    const id = pathname.replace(/^\//, "").split("/")[0]
    return id && id.length >= 8 ? id : null
  }
  if (!YOUTUBE_HOSTS.has(h) && !YOUTUBE_HOSTS.has("www." + h)) return null
  const v = searchParams.get("v")
  return v || null
}

function stripMarketingParams(searchParams: URLSearchParams): void {
  const drop = /^utm_/i
  ;[...searchParams.keys()].forEach((k) => {
    if (drop.test(k)) searchParams.delete(k)
    if (/^fbclid$/i.test(k)) searchParams.delete(k)
    if (/^gclid$/i.test(k)) searchParams.delete(k)
  })
}

/** Normalized fingerprint for duplicate grouping (null si URL inválida). */
export function normalizeUrlDedupeKey(raw: string): string | null {
  try {
    const u = new URL(raw.trim())
    u.hash = ""

    stripMarketingParams(u.searchParams)

    const host = u.hostname.replace(/^www\./i, "").toLowerCase()
    let pathname = u.pathname.replace(/\/+$/, "") || "/"
    pathname = stripAmpPath(pathname)

    const yt = extractYouTubeWatchId(host, pathname, u.searchParams)
    if (yt) {
      return `youtube:${yt}`
    }

    const sortedKeys = [...u.searchParams.keys()].toSorted()
    const qp = sortedKeys
      .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(u.searchParams.get(k) || "")}`)
      .join("&")
    const q = qp ? `?${qp}` : ""
    const protocol = u.protocol === "http:" ? "https:" : u.protocol

    return `${protocol}//${host}${pathname}${q}`.toLowerCase()
  } catch {
    return null
  }
}
