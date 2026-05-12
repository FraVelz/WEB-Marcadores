import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { DEMO_BOOKMARKS } from "@/lib/demo-data"

type UserLike = { email?: string } | null

export function useBookmarkCount(demoMode: boolean, user: UserLike) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let nextCount: number | null
      if (demoMode) {
        nextCount = DEMO_BOOKMARKS.length
      } else if (!user) {
        nextCount = null
      } else {
        const sb = createClient()
        const { count: rowCount } = await sb.from("bookmarks").select("*", { count: "exact", head: true })
        nextCount = rowCount ?? 0
      }
      if (!cancelled) setCount(nextCount)
    })()
    return () => {
      cancelled = true
    }
  }, [demoMode, user])

  return { count }
}
