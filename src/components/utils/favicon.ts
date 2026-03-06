/**
 * Utilidades para favicons de marcadores
 */

export function getFaviconUrl(url: string, size = 32): string {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=${size}`;
  } catch {
    return '';
  }
}

export function getDomain(url: string): string {
  try {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  } catch {
    return url;
  }
}
