"use client"

import { APP_SCREENSHOTS } from "@/lib/siteScreenshots"
import { FOCUS_RING } from "@/lib/focusStyles"
import { cn } from "@/lib/utils"

import { LoginScreenshotLink } from "./components/LoginScreenshotLink"
import { useLogin } from "./useLogin"

import type { LoginType } from "./types"

export function LoginPage({ demo }: { demo: boolean }) {
  const { email, password, loading, error, info, setEmail, setPassword, handleDemo, handleLogin, handleSignUp } =
    useLogin(demo) as LoginType

  return (
    <div className="bg-app-login-canvas flex min-h-screen flex-col items-center justify-center gap-8 p-4 lg:flex-row lg:items-start lg:gap-10 lg:py-10">
      <main className="border-app-login-border bg-app-login-card w-full max-w-md shrink-0 rounded-xl border px-5 py-6 shadow-xl sm:p-8">
        <h1 className="text-app-fg mb-5 text-xl font-semibold sm:mb-6 sm:text-2xl">Marcadores</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
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
            aria-label="Contraseña"
            value={password}
            data-no-vim
            onChange={(e) => setPassword(e.target.value)}
            className={cn(
              "border-app-border bg-app-raised-muted text-app-fg rounded-lg border px-4 py-2",
              "placeholder-app-fg-label focus:border-app-focus focus:outline-none"
            )}
            required
          />

          {info && (
            <p className="border-app-warn-border bg-app-warn-surface text-app-warn-fg rounded-lg border px-3 py-2 text-sm">
              {info}
            </p>
          )}

          {error && <p className="text-app-danger-fg text-sm">{error}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "bg-app-primary flex-1 rounded-lg px-4 py-2 font-medium text-white",
                FOCUS_RING,
                "hover:bg-app-primary-hover cursor-pointer disabled:opacity-50"
              )}
            >
              {loading ? "…" : "Entrar"}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                handleSignUp()
              }}
              disabled={loading}
              className={cn(
                "border-app-input-border text-app-fg-secondary rounded-lg border px-4 py-2",
                FOCUS_RING,
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
            onClick={(e) => {
              e.preventDefault()
              handleDemo()
            }}
            className={cn(
              "bg-app-login-demo-btn mt-3 w-full cursor-pointer rounded-lg py-2 font-medium text-white",
              FOCUS_RING,
              "hover:bg-app-login-demo-btn-hover"
            )}
          >
            Probar demo
          </button>
        </div>
      </main>

      <section className="w-full max-w-xl lg:max-w-2xl" aria-labelledby="login-screenshots-title">
        <h2
          id="login-screenshots-title"
          className="text-app-fg-label mb-3 text-center text-xs font-medium tracking-wide uppercase lg:text-left"
        >
          Apartados de la app
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {APP_SCREENSHOTS.map((shot) => (
            <li key={shot.id}>
              <LoginScreenshotLink
                href={demo ? "/demo" : shot.href}
                label={shot.label}
                alt={shot.alt}
                publicPath={shot.publicPath}
              />
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
