/**
 * Imprime SQL para bookmarks.
 * Uso: pnpm run db:sql           (crear tabla desde cero)
 *      pnpm run db:sql:section   (copiar section → tags, sin borrar section)
 *      pnpm run db:sql:theme     (añadir theme y subtheme)
 */
import { readFileSync } from "fs";
import { join } from "path";

const useSection = process.argv.includes("--section");
const useTheme = process.argv.includes("--theme");
const file = useTheme
  ? "20250306000007_add_theme_subtheme.sql"
  : useSection
    ? "20250306000006_section_to_tags.sql"
    : "20250306000004_create_bookmarks_tags_only.sql";
const sql = readFileSync(join(process.cwd(), "supabase/migrations", file), "utf-8");

console.log("\n--- Copia el SQL y pégalo en Supabase > SQL Editor > Run ---\n");
console.log(sql);
console.log("\n--- Fin ---\n");
