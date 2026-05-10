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
    router.push(demo ? "/marcadores" : "/demo")
  }

  const authenticate = async (type: "login" | "signup") => {
    if (!email || !password) {
      setError("Completa todos los campos")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const action =
        type === "login"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({ email, password })

      const { error } = await action

      if (error) {
        setError(type === "login" ? "Correo o contraseña incorrectos" : error.message)
        return
      }

      router.push("/marcadores")
    } catch {
      setError("Ocurrió un error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    password,
    loading,
    error,
    setEmail,
    setPassword,
    handleDemo,
    handleLogin: () => authenticate("login"),
    handleSignUp: () => authenticate("signup"),
  }
}
