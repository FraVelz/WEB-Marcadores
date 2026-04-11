"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/contexts/DashboardContext"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DEMO_BOOKMARKS } from "@/lib/demo-data"

export function PerfilPage() {
  const { demoMode } = useDashboard()
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      if (demoMode) {
        setUser({ email: "demo@ejemplo.com" })
        setBookmarkCount(DEMO_BOOKMARKS.length)
        return
      }
      const {
        data: { user: u },
      } = await supabase.auth.getUser()
      setUser(u ?? null)
      if (u) {
        const { count } = await supabase.from("bookmarks").select("*", { count: "exact", head: true })
        setBookmarkCount(count ?? 0)
      }
    }
    fetchData()
  }, [supabase, demoMode])

  const handleSignOut = async () => {
    if (demoMode) {
      router.push("/")
      router.refresh()
      return
    }
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    if (demoMode) return
    e.preventDefault()
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    setPasswordLoading(true)
    setPasswordMsg("")
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordLoading(false)
    if (error) {
      setPasswordMsg(error.message)
    } else {
      setPasswordMsg("Contraseña actualizada correctamente.")
      setNewPassword("")
    }
  }

  return (
    <div className="overflow-auto p-6">
      <h1 className="text-app-fg mb-6 text-2xl font-bold">Perfil</h1>
      <div className="max-w-md space-y-6">
        <div className="border-app-border-muted bg-app-raised rounded-lg border p-6">
          {user ? (
            <>
              <p className="text-app-fg-secondary">
                <span className="text-app-fg-label">Email:</span> {user.email}
              </p>
              {bookmarkCount !== null && (
                <p className="text-app-fg-secondary mt-2">
                  <span className="text-app-fg-label">Marcadores:</span> {bookmarkCount}
                </p>
              )}
              <button
                onClick={handleSignOut}
                className="border-app-input-border text-app-fg-secondary hover:bg-app-raised-muted mt-4 rounded-lg border px-4 py-2"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <p className="text-app-fg-muted">No hay sesión activa.</p>
          )}
        </div>
        {user && (
          <form onSubmit={handleChangePassword} className="border-app-border-muted bg-app-raised rounded-lg border p-6">
            <h2 className="text-app-fg mb-4 text-lg font-semibold">Cambiar contraseña</h2>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              data-no-vim
              onChange={(e) => setNewPassword(e.target.value)}
              className={cn(
                "border-app-input-border bg-app-raised-muted text-app-fg w-full rounded-lg border px-4 py-2",
                "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
              )}
              minLength={6}
            />
            <button
              type="submit"
              disabled={passwordLoading}
              className={cn(
                "bg-app-primary mt-3 rounded-lg px-4 py-2 font-medium text-white",
                "hover:bg-app-primary-hover disabled:opacity-50"
              )}
            >
              {passwordLoading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
            {passwordMsg && (
              <p
                className={`mt-2 text-sm ${passwordMsg.includes("correctamente") ? "text-app-success-fg" : "text-app-danger-fg"}`}
              >
                {passwordMsg}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
