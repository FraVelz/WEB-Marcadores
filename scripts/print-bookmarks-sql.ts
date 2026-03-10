/**
 * Imprime SQL para bookmarks.
 * Uso: pnpm run db:sql
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
