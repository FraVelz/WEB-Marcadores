import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function useAuthActions(demoMode: boolean) {
  const router = useRouter()
  const supabase = createClient()

  const signOut = async () => {
    if (demoMode) {
      router.push("/")
      router.refresh()
      return
    }

    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return { signOut }
}
