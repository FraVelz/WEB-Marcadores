import { createClient } from "@/lib/supabase/client"
import { useState, type FormEvent } from "react"

export function useChangePassword(demoMode: boolean) {
  const supabase = createClient()
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!newPassword || newPassword.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.")
      return
    }

    if (demoMode) {
      setMessage(
        "Contraseña actualizada correctamente (solo demostración; no se guarda en el servidor)."
      )
      setNewPassword("")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setLoading(false)

    if (error) {
      setMessage(error.message)
    } else {
      setMessage("Contraseña actualizada correctamente.")
      setNewPassword("")
    }
  }

  return {
    newPassword,
    setNewPassword,
    loading,
    message,
    handleSubmit,
  }
}
