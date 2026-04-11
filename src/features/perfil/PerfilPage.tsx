"use client"

import { cn } from "@/lib/utils"
import { useDashboard } from "@/contexts/DashboardContext"
import { useAuthActions, useBookmarkCount, useChangePassword, useUser } from "./hooks"

export function PerfilPage() {
  const { demoMode } = useDashboard()

  const { user } = useUser(demoMode)
  const { count: bookmarkCount } = useBookmarkCount(demoMode, user)
  const { signOut } = useAuthActions(demoMode)
  const { newPassword, setNewPassword, loading, message, handleSubmit } = useChangePassword(demoMode)

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
                type="button"
                onClick={() => void signOut()}
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
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="border-app-border-muted bg-app-raised rounded-lg border p-6"
          >
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
              disabled={loading}
              className={cn(
                "bg-app-primary mt-3 rounded-lg px-4 py-2 font-medium text-white",
                "hover:bg-app-primary-hover disabled:opacity-50"
              )}
            >
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </button>
            {message && (
              <p
                className={`mt-2 text-sm ${message.includes("correctamente") ? "text-app-success-fg" : "text-app-danger-fg"}`}
              >
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
