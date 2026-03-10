import { redirect } from "next/navigation";

function isDemoMode(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true") return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url === "" || key === "";
}

/**
 * Ruta /demo: redirige a la interfaz principal en modo demo (sin login).
 * Útil para compartir enlaces directos a la versión demo.
 */
export default function DemoPage() {
  if (isDemoMode()) {
    redirect("/marcadores");
  }
  redirect("/");
}
