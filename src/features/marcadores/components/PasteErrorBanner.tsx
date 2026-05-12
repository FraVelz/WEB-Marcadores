"use client"

import { cn } from "@/lib/utils"

type Props = { message: string }

export default function PasteErrorBanner({ message }: Props) {
  return (
    <div
      className={cn(
        "border-app-danger-border flex items-center justify-center gap-2 border-b",
        "bg-app-danger-surface text-app-danger-banner-fg px-3 py-2 text-sm"
      )}
    >
      <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
      </svg>
      {message}
    </div>
  )
}
