/** Mensajes de error de Supabase Auth traducidos al español. */
export function translateAuthError(message: string, type: "login" | "signup"): string {
  const normalized = message.toLowerCase()

  if (normalized.includes("email not confirmed")) {
    return "Confirma tu correo antes de entrar. Revisa tu bandeja de entrada."
  }

  if (normalized.includes("invalid login credentials")) {
    return "Correo o contraseña incorrectos"
  }

  if (normalized.includes("user already registered")) {
    return "Ya existe una cuenta con ese correo"
  }

  if (normalized.includes("password") && normalized.includes("least")) {
    return "La contraseña no cumple los requisitos mínimos"
  }

  if (type === "login") {
    return message
  }

  return message
}
