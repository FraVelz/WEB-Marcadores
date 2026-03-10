/**
 * Exporta marcadores de Supabase a JSON (stdout).
 * Uso: pnpm run fetch:bookmarks > bookmarks.json
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL y clave");
  process.exit(1);
}

const supabase = createClient(url, key);

async function main() {
  const { data, error } = await supabase.from("bookmarks").select("*").order("title");
  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log(JSON.stringify(data || [], null, 2));
}

main();
