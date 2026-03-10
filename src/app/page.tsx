"use client";

import { useState } from "react";
import { createClient, isDemoMode } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const demo = isDemoMode();

  const handleDemo = () => {
    // /demo setea cookie y redirige a marcadores; si ya hay demo, ir directo
    router.push(demo ? "/marcadores" : "/demo");
    router.refresh();
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/marcadores");
    router.refresh();
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/marcadores");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <main className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="mb-6 text-2xl font-bold text-white">Marcadores</h1>
        <div className="mb-4 rounded-lg border border-amber-600/50 bg-amber-900/20 p-3 text-sm text-amber-200">
          <p className="font-medium">Modo demo</p>
          <p className="mt-1 text-amber-300/90">
            Prueba la interfaz sin iniciar sesión. Explora marcadores, carpetas y atajos.
          </p>
          <button
            type="button"
            onClick={handleDemo}
            className="mt-3 w-full rounded-lg bg-amber-600 py-2 font-medium text-white hover:bg-amber-700"
          >
            Probar demo
          </button>
          <a
            href="/demo"
            className="mt-2 block text-center text-xs text-amber-400/90 hover:text-amber-300"
          >
            Enlace directo: /demo
          </a>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            data-no-vim
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            data-no-vim
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-white placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "..." : "Entrar"}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="rounded-lg border border-zinc-600 px-4 py-2 text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
            >
              Registrarse
            </button>
          </div>
        </form>
        {demo && (
          <p className="mt-4 text-center text-xs text-zinc-500">
            Los formularios de login/registro no funcionan en modo demo.
          </p>
        )}
      </main>
    </div>
  );
}
