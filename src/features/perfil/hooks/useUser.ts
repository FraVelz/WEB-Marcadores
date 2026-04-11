import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

export function useUser(demoMode: boolean) {
  const supabase = createClient()
  const [user, setUser] = useState<{ email?: string } | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      if (demoMode) {
        setUser({ email: "demo@ejemplo.com" })
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user ?? null)
    }

    fetchUser()
  }, [demoMode])

  return { user }
}
