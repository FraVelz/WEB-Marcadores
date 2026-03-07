/**
 * Script para crear la tabla bookmarks en Supabase.
 *
 * Uso: pnpm run db:create-table
 *
 * En .env.local (usa pooler, evita problemas de IPv6/DNS):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_DB_PASSWORD=tu_contraseña_postgres
 *   SUPABASE_DB_REGION=us-east-1  (o eu-west-1, ap-southeast-1)
 *
 * La contraseña en: Supabase > Project Settings > Database > Database password
 * La región en: Supabase > Project Settings > General (ej. East US = us-east-1)
 */
import { Client } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const MIGRATION_PATH = join(process.cwd(), "supabase/migrations/20250306000000_create_bookmarks.sql");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  const region = process.env.SUPABASE_DB_REGION || "us-east-1";

  if (!url || !password) {
    console.error(
      "Faltan variables en .env.local:\n" +
        "  NEXT_PUBLIC_SUPABASE_URL\n" +
        "  SUPABASE_DB_PASSWORD (Project Settings > Database)\n" +
        "  SUPABASE_DB_REGION (opcional, default: us-east-1)"
    );
    process.exit(1);
  }

  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) {
    console.error("NEXT_PUBLIC_SUPABASE_URL no tiene el formato esperado (https://xxx.supabase.co)");
    process.exit(1);
  }
  const projectRef = match[1];

  // Parámetros separados evitan Invalid URL con contraseñas con caracteres especiales
  const client = new Client({
    host: `aws-0-${region}.pooler.supabase.com`,
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password.trim(),
    database: "postgres",
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const sql = readFileSync(MIGRATION_PATH, "utf-8");

    // pg solo ejecuta un statement a la vez; dividir por punto y coma
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const stmt of statements) {
      try {
        await client.query(stmt + ";");
        console.log("✓", stmt.split(/\s+/).slice(0, 4).join(" ") + "...");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("already exists")) {
          console.log("⊘ Ya existe, omitiendo");
        } else {
          throw err;
        }
      }
    }

    console.log("\nTabla bookmarks lista.");
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
