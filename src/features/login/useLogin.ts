import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { authenticateWithEmailPassword } from "./authenticate-email"
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

    setLoading(true)
    setError(null)

    const result = await authenticateWithEmailPassword({ supabase, type, email, password })

    if (!result.ok) {
      if (result.kind === "auth") {
        setError(type === "login" ? "Correo o contraseña incorrectos" : result.message)
      } else {
        setError("Ocurrió un error inesperado")
      }
      setLoading(false)
      return
    }

    router.push("/marcadores")
    setLoading(false)
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
