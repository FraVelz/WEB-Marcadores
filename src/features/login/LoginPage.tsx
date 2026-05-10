"use client"

import { cn } from "@/lib/utils"
import { useLogin } from "./useLogin"

import type { LoginType } from "./types"

export function LoginPage({ demo }: { demo: boolean }) {
  const { email, password, loading, error, setEmail, setPassword, handleDemo, handleLogin, handleSignUp } = useLogin(
    demo
  ) as LoginType

  return (
    <div className="bg-app-login-canvas flex min-h-screen items-center justify-center p-4">
      <main className="border-app-login-border bg-app-login-card w-full max-w-md rounded-xl border px-5 py-6 shadow-xl sm:p-8">
        <h1 className="text-app-fg mb-5 text-xl font-bold sm:mb-6 sm:text-2xl">Marcadores</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            data-no-vim
            onChange={(e) => setEmail(e.target.value)}
            className={cn(
              "border-app-border bg-app-raised-muted text-app-fg rounded-lg border px-4 py-2",
              "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
            )}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            data-no-vim
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "border-app-border bg-app-raised-muted text-app-fg rounded-lg border px-4 py-2",
              "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
            )}
            required
          />

          {error && <p className="text-app-danger-fg text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "bg-app-primary flex-1 rounded-lg px-4 py-2 font-medium text-white",
                "hover:bg-app-primary-hover cursor-pointer disabled:opacity-50"
              )}
            >
              {loading ? "..." : "Entrar"}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className={cn(
                "border-app-input-border text-app-fg-secondary rounded-lg border px-4 py-2",
                "hover:bg-app-raised-muted cursor-pointer disabled:opacity-50"
              )}
            >
              Registrarse
            </button>
          </div>
        </form>

        <div className="border-app-warn-border bg-app-warn-surface text-app-warn-fg mt-10 rounded-lg border p-3 text-sm">
          <p className="font-medium">Modo demo</p>

          <p className="text-app-warn-fg-accent mt-1">
            Prueba la interfaz sin iniciar sesión. Explora marcadores, carpetas y atajos.
          </p>

          <button
            type="button"
            onClick={handleDemo}
            className={cn(
              "bg-app-login-demo-btn mt-3 w-full cursor-pointer rounded-lg py-2 font-medium text-white",
              "hover:bg-app-login-demo-btn-hover"
            )}
          >
            Probar demo
          </button>
        </div>
      </main>
    </div>
  )
}
