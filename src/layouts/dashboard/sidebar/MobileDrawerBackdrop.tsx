import { cn } from "@/lib/utils"

type Props = {
  open: boolean
  onClose: () => void
}

export function MobileDrawerBackdrop({ open, onClose }: Props) {
  return (
    <button
      type="button"
      aria-label="Cerrar menú"
      aria-hidden={!open}
      className={cn(
        "bg-app-overlay fixed inset-0 z-30 transition-opacity md:hidden",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      tabIndex={-1}
      onClick={onClose}
    />
  )
}
