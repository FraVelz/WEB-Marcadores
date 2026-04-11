import { useState } from "react"

import { createClient } from "@/lib/supabase/client"

import { useRouter } from "next/navigation"
import type { LoginType } from "./types"

export function useLogin(demo: boolean): LoginType {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDemo = () => {
    // /demo setea cookie y redirige a marcadores; si ya hay demo, ir directo
    router.push(demo ? "/marcadores" : "/demo")
    router.refresh()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push("/marcadores")
    router.refresh()
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }
    router.push("/marcadores")
    router.refresh()
  }

  return {
    email,
    password,
    loading,
    error,
    setEmail,
    setPassword,
    handleDemo,
    handleLogin,
    handleSignUp,
  }
}
