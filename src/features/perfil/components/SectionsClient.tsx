"use client"

import { useAuthActions, useBookmarkCount, useChangePassword, useUser } from "../hooks"
import { useDashboard } from "@/contexts/DashboardContext"

import { cn } from "@/lib/utils"
import { FOCUS_RING } from "@/lib/focusStyles"

import { AppearanceSettings } from "./AppearanceSettings"

export function SectionsClient() {
  const { demoMode } = useDashboard()

  const { user } = useUser(demoMode)
  const { count: bookmarkCount } = useBookmarkCount(demoMode, user)
  const { signOut } = useAuthActions(demoMode)
  const { newPassword, setNewPassword, loading, message, handleSubmit } = useChangePassword(demoMode)

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 px-1 sm:px-0">
      <AppearanceSettings />

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
              className={cn(
                "border-app-input-border text-app-fg-secondary mt-4 rounded-lg border px-4 py-2",
                FOCUS_RING,
                "hover:bg-app-raised-muted cursor-pointer"
              )}
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
              FOCUS_RING,
              "hover:bg-app-primary-hover cursor-pointer disabled:opacity-50"
            )}
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
          {message && (
            <p
              className={cn(
                "mt-2 text-sm",
                message.includes("correctamente") ? "text-app-success-fg" : "text-app-danger-fg"
              )}
            >
              {message}
            </p>
          )}
        </form>
      )}
    </div>
  )
}
