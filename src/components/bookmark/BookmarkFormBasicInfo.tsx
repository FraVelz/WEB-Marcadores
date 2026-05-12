"use client"

import { cn } from "@/lib/utils"

type Props = {
  title: string
  url: string
  description: string
  firstInputRef: React.RefObject<HTMLInputElement | null>
}

export default function BookmarkFormBasicInfo({ title, url, description, firstInputRef }: Props) {
  return (
    <section className="space-y-4">
      <h3 className="text-app-fg-muted text-sm font-medium">Información básica</h3>
      <div>
        <label htmlFor="bm-modal-title" className="text-app-fg-label mb-1 block text-xs">
          Título *
        </label>
        <input
          id="bm-modal-title"
          ref={firstInputRef}
          name="title"
          defaultValue={title}
          required
          autoComplete="off"
          data-no-vim
          className={cn(
            "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2",
            "focus:border-app-focus focus:outline-none"
          )}
        />
      </div>
      <div>
        <label htmlFor="bm-modal-url" className="text-app-fg-label mb-1 block text-xs">
          URL *
        </label>
        <input
          id="bm-modal-url"
          name="url"
          type="url"
          defaultValue={url}
          required
          data-no-vim
          className={cn(
            "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2",
            "focus:border-app-focus focus:outline-none"
          )}
        />
      </div>
      <div>
        <label htmlFor="bm-modal-description" className="text-app-fg-label mb-1 block text-xs">
          Descripción
        </label>
        <input
          id="bm-modal-description"
          name="description"
          defaultValue={description}
          data-no-vim
          className={cn(
            "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-3 py-2",
            "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
          )}
        />
      </div>
    </section>
  )
}
