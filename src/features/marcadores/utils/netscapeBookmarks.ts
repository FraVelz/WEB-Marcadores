import { isHttpUrl } from "@/lib/isHttpUrl"

/** Nodo de carpeta o enlace parseado desde HTML Netscape Bookmark. */
export type NetscapeNode =
  | { type: "folder"; name: string; children: NetscapeNode[] }
  | { type: "link"; title: string; url: string }

export type ParseNetscapeResult = {
  roots: NetscapeNode[]
  skippedLinks: number
  linkCount: number
  folderCount: number
}

const MAX_IMPORT_BYTES = 5 * 1024 * 1024

export function assertImportSize(byteLength: number): void {
  if (byteLength > MAX_IMPORT_BYTES) {
    throw new Error(`El archivo supera el límite de ${MAX_IMPORT_BYTES / (1024 * 1024)} MB`)
  }
}

/**
 * Parsea bookmarks en formato Netscape Bookmark File (export de Chrome/Firefox/Edge).
 * Solo acepta http(s); descarta javascript:/data: y HREF vacíos.
 */
export function parseNetscapeBookmarksHtml(html: string): ParseNetscapeResult {
  const normalized = html.replace(/\r\n?/g, "\n")
  const tokens = tokenizeNetscape(normalized)
  const roots: NetscapeNode[] = []
  const stack: NetscapeNode[][] = [roots]
  let pendingFolder: { type: "folder"; name: string; children: NetscapeNode[] } | null = null
  let skippedLinks = 0
  let linkCount = 0
  let folderCount = 0

  for (const token of tokens) {
    if (token.kind === "h3") {
      pendingFolder = { type: "folder", name: decodeHtmlEntities(token.text) || "Sin nombre", children: [] }
      folderCount += 1
      stack[stack.length - 1]!.push(pendingFolder)
    } else if (token.kind === "dl_open") {
      if (pendingFolder) {
        stack.push(pendingFolder.children)
        pendingFolder = null
      } else {
        // DL raíz u orfandad: seguir en el nivel actual
      }
    } else if (token.kind === "dl_close") {
      if (stack.length > 1) stack.pop()
      pendingFolder = null
    } else if (token.kind === "a") {
      const url = decodeHtmlEntities(token.href).trim()
      const title = decodeHtmlEntities(token.text).trim() || url
      if (!isHttpUrl(url)) {
        skippedLinks += 1
        continue
      }
      stack[stack.length - 1]!.push({ type: "link", title, url })
      linkCount += 1
    }
  }

  return { roots, skippedLinks, linkCount, folderCount }
}

type Token =
  | { kind: "h3"; text: string }
  | { kind: "a"; href: string; text: string }
  | { kind: "dl_open" }
  | { kind: "dl_close" }

function tokenizeNetscape(html: string): Token[] {
  const tokens: Token[] = []
  const re = /<(DL)\b[^>]*>|<\/(DL)\s*>|<(H3)\b[^>]*>([\s\S]*?)<\/H3\s*>|<(A)\b([^>]*)>([\s\S]*?)<\/A\s*>/gi
  let match: RegExpExecArray | null
  while ((match = re.exec(html)) !== null) {
    if (match[1]) {
      tokens.push({ kind: "dl_open" })
    } else if (match[2]) {
      tokens.push({ kind: "dl_close" })
    } else if (match[3]) {
      tokens.push({ kind: "h3", text: stripTags(match[4] ?? "") })
    } else if (match[5]) {
      const attrs = match[6] ?? ""
      const hrefMatch = /\bHREF\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs)
      const href = hrefMatch?.[1] ?? hrefMatch?.[2] ?? hrefMatch?.[3] ?? ""
      tokens.push({ kind: "a", href, text: stripTags(match[7] ?? "") })
    }
  }
  return tokens
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, "").trim()
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)))
}
