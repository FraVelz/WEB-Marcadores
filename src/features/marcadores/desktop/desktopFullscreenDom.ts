async function exitDocumentFullscreen() {
  const d = document as Document & {
    webkitExitFullscreen?: () => Promise<void>
    mozCancelFullScreen?: () => Promise<void>
  }
  if (document.exitFullscreen) await document.exitFullscreen()
  else if (d.webkitExitFullscreen) await d.webkitExitFullscreen()
  else if (d.mozCancelFullScreen) await d.mozCancelFullScreen()
}

async function requestElFullscreen(el: HTMLElement) {
  const anyEl = el as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>
    mozRequestFullScreen?: () => Promise<void>
  }
  if (el.requestFullscreen) await el.requestFullscreen()
  else if (anyEl.webkitRequestFullscreen) await anyEl.webkitRequestFullscreen()
  else if (anyEl.mozRequestFullScreen) await anyEl.mozRequestFullScreen()
}

function getFullscreenElement(): Element | null {
  const d = document as Document & {
    webkitFullscreenElement?: Element | null
    mozFullScreenElement?: Element | null
  }
  return document.fullscreenElement ?? d.webkitFullscreenElement ?? d.mozFullScreenElement ?? null
}

/** Alterna fullscreen del host del dashboard (fallbacks Safari/Firefox). */
export async function toggleElementFullscreen(fullscreenTargetEl: HTMLElement | null) {
  if (!fullscreenTargetEl) return
  try {
    if (getFullscreenElement() === fullscreenTargetEl) await exitDocumentFullscreen()
    else await requestElFullscreen(fullscreenTargetEl)
  } catch {
    /* El navegador puede rechazar sin gesto explícito */
  }
}

export function isElementFullscreen(fullscreenTargetEl: HTMLElement | null) {
  if (!fullscreenTargetEl) return false
  return getFullscreenElement() === fullscreenTargetEl
}

export function subscribeFullscreenChange(sync: () => void) {
  document.addEventListener("fullscreenchange", sync)
  document.addEventListener("webkitfullscreenchange", sync)
  return () => {
    document.removeEventListener("fullscreenchange", sync)
    document.removeEventListener("webkitfullscreenchange", sync)
  }
}
