import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { DEMO_BOOKMARKS } from "@/lib/demo-data"

type UserLike = { email?: string } | null

export function useBookmarkCount(demoMode: boolean, user: UserLike) {
  const supabase = createClient()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchCount = async () => {
      if (demoMode) {
        setCount(DEMO_BOOKMARKS.length)
        return
      }

      if (!user) {
        setCount(null)
        return
      }

      const { count: rowCount } = await supabase.from("bookmarks").select("*", { count: "exact", head: true })

      setCount(rowCount ?? 0)
    }

    fetchCount()
  }, [demoMode, user])

  return { count }
}
