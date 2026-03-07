/**
 * Imprime el SQL para crear la tabla bookmarks.
 * Sin conexión - copia y pega en Supabase > SQL Editor.
 *
 * Uso: pnpm run db:sql        (crear desde cero, borra tabla existente)
 */
import { readFileSync } from "fs";
import { join } from "path";

const sql = readFileSync(
  join(process.cwd(), "supabase/migrations/20250306000004_create_bookmarks_tags_only.sql"),
  "utf-8"
);

console.log("\n--- Copia el SQL y pégalo en Supabase > SQL Editor > Run ---\n");
console.log(sql);
console.log("\n--- Fin ---\n");
