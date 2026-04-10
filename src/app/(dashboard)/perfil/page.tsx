"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { createClient, isDemoMode } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DEMO_BOOKMARKS } from "@/lib/demo-data"

export default function PerfilPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [passwordMsg, setPasswordMsg] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      if (isDemoMode()) {
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
  }, [supabase])

  const handleSignOut = async () => {
    if (isDemoMode()) {
      router.push("/")
      router.refresh()
      return
    }
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    if (isDemoMode()) return
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
      <h1 className="mb-6 text-2xl font-bold text-white">Perfil</h1>
      <div className="max-w-md space-y-6">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          {user ? (
            <>
              <p className="text-zinc-300">
                <span className="text-zinc-500">Email:</span> {user.email}
              </p>
              {bookmarkCount !== null && (
                <p className="mt-2 text-zinc-300">
                  <span className="text-zinc-500">Marcadores:</span> {bookmarkCount}
                </p>
              )}
              <button
                onClick={handleSignOut}
                className="mt-4 rounded-lg border border-zinc-600 px-4 py-2 text-zinc-300 hover:bg-zinc-800"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <p className="text-zinc-400">No hay sesión activa.</p>
          )}
        </div>
        {user && (
          <form onSubmit={handleChangePassword} className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Cambiar contraseña</h2>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              data-no-vim
              onChange={(e) => setNewPassword(e.target.value)}
              className={cn(
                "w-full rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-white",
                "placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
              )}
              minLength={6}
            />
            <button
              type="submit"
              disabled={passwordLoading}
              className={cn(
                "mt-3 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white",
                "hover:bg-blue-700 disabled:opacity-50"
              )}
            >
              {passwordLoading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
            {passwordMsg && (
              <p
                className={`mt-2 text-sm ${passwordMsg.includes("correctamente") ? "text-green-400" : "text-red-400"}`}
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
