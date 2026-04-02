import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <main className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-xl">
        <p className="font-mono text-6xl font-bold text-zinc-600">404</p>
        <h1 className="mt-4 text-xl font-semibold text-white">
          Página no encontrada
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          La ruta que buscas no existe o ha cambiado.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Volver al inicio
        </Link>
      </main>
    </div>
  );
}
