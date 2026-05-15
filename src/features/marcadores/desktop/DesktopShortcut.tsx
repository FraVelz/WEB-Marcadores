"use client"

import { cn } from "@/lib/utils"

type Props = {
  label: string
  icon: React.ReactNode
  onDoubleClick: () => void
}

export function DesktopShortcut({ label, icon, onDoubleClick }: Props) {
  return (
    <button
      type="button"
      className={cn(
        "border-app-border-muted text-app-fg hover:bg-app-hover focus-visible:ring-app-focus group flex w-[5.5rem] flex-col items-center gap-1 rounded-md border border-transparent p-2 text-center shadow-none outline-none focus-visible:ring-2"
      )}
      onDoubleClick={(e) => {
        e.preventDefault()
        onDoubleClick()
      }}
      title={`${label} (doble clic para abrir)`}
    >
      <span className="bg-app-raised group-hover:bg-app-sidebar flex size-12 items-center justify-center rounded-lg border border-white/10 text-2xl shadow-md">
        {icon}
      </span>
      <span className="text-app-fg line-clamp-2 w-full max-w-[5.5rem] text-[11px] leading-tight font-medium">
        {label}
      </span>
    </button>
  )
}
