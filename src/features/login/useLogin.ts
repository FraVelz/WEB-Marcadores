import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { authenticateWithEmailPassword } from "./authenticate-email"
import { translateAuthError } from "./auth-error-messages"
import type { LoginType } from "./types"

const VERIFY_PENDING_MESSAGE =
  "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada y vuelve a iniciar sesión."

const SIGNUP_CONFIRM_MESSAGE = "Cuenta creada. Revisa tu correo para confirmar la cuenta antes de entrar."

export function useLogin(demo: boolean): LoginType {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const verifyPending = searchParams.get("verify") === "pending"
  const displayInfo = info ?? (verifyPending ? VERIFY_PENDING_MESSAGE : null)

  const handleDemo = () => {
    router.push(demo ? "/marcadores" : "/demo")
  }

  const authenticate = async (type: "login" | "signup") => {
    if (!email || !password) {
      setError("Completa todos los campos")
      setInfo(null)
      return
    }

    setLoading(true)
    setError(null)
    setInfo(null)

    const result = await authenticateWithEmailPassword({ supabase, type, email, password })

    if (!result.ok) {
      if (result.kind === "auth") {
        setError(translateAuthError(result.message, type))
      } else {
        setError("Ocurrió un error inesperado")
      }
      setLoading(false)
      return
    }

    if (result.needsEmailConfirmation) {
      setInfo(SIGNUP_CONFIRM_MESSAGE)
      setLoading(false)
      return
    }

    router.push("/marcadores")
    setLoading(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    await authenticate("login")
  }

  const handleSignUp = async () => {
    await authenticate("signup")
  }

  return {
    email,
    password,
    loading,
    error,
    info: displayInfo,
    setEmail,
    setPassword,
    handleDemo,
    handleLogin,
    handleSignUp,
  }
}
