import { toast } from "@pheralb/toast"

export function notifyPasteError(message: string) {
  toast.error({ text: message })
}
