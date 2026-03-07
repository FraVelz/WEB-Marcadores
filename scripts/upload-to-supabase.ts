/**
 * Script para subir marcadores desde src/data/bookmarks/*.json a Supabase.
 *
 * Uso: pnpm run upload:supabase
 *
 * Variables obligatorias:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Para subir a tu cuenta personal, añade en .env.local:
 *   SUPABASE_USER_EMAIL=tu@email.com
 *   SUPABASE_USER_PASSWORD=tu_contraseña
 *
 * Sin email/password, sube con user_id=null (visible para todos).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "src/data/bookmarks");

type Link = { type: string; title: string; url: string; path?: string[] };
type FolderData = { type: string; name: string; slug?: string; children?: FolderData[]; links?: Link[] };

function extractLinks(
  obj: FolderData,
  tagsSoFar: string[],
  acc: { title: string; url: string; tags: string[]; description?: string }[]
): void {
  const currentTag = obj.name || "";
  const tags = currentTag ? [...tagsSoFar, currentTag] : tagsSoFar;
  if (obj.links) {
    for (const link of obj.links) {
      if (link.type === "link" && link.title && link.url) {
        acc.push({
          title: link.title,
          url: link.url,
          tags: tags.length ? tags : ["general"],
          description: (link as { description?: string }).description,
        });
      }
    }
  }
  if (obj.children) {
    for (const child of obj.children) {
      extractLinks(child, tags, acc);
    }
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Falta NEXT_PUBLIC_SUPABASE_URL y (SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY)");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  // Si hay credenciales, iniciar sesión para asociar marcadores al usuario
  let userId: string | null = null;
  const email = process.env.SUPABASE_USER_EMAIL;
  const password = process.env.SUPABASE_USER_PASSWORD;
  if (email && password) {
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      console.error("Error al iniciar sesión:", authError.message);
      process.exit(1);
    }
    userId = user?.id ?? null;
    console.log(`Sesión iniciada como ${email}. Marcadores se guardarán en tu cuenta.`);
  } else {
    console.log("Sin SUPABASE_USER_EMAIL/PASSWORD. Subiendo con user_id=null.");
  }

  const allBookmarks: { title: string; url: string; tags: string[]; description?: string }[] = [];

  // Opción 1: usar index.json si tiene allLinks
  const indexPath = join(DATA_DIR, "index.json");
  try {
    const index = JSON.parse(readFileSync(indexPath, "utf-8"));
    if (index.allLinks) {
      for (const link of index.allLinks) {
        if (link.type === "link" && link.title && link.url) {
          const pathTags = (link.path as string[] | undefined) || [];
          const tags = pathTags.length ? pathTags : ["general"];
          allBookmarks.push({
            title: link.title,
            url: link.url,
            tags,
            description: (link as { description?: string }).description,
          });
        }
      }
      console.log(`index.json: ${index.allLinks.length} enlaces`);
    }
  } catch (e) {
    console.warn("index.json no encontrado o inválido, usando archivos por carpeta");
  }

  // Opción 2: leer cada JSON de carpeta (estructura folder con children/links)
  if (allBookmarks.length === 0) {
    const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json") && f !== "index.json");
    for (const file of files) {
      const data = JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
      const folderName = (data as { name?: string }).name || file.replace(".json", "");
      extractLinks(data, folderName ? [folderName] : [], allBookmarks);
    }
    console.log(`Carpetas: ${allBookmarks.length} enlaces extraídos`);
  }

  if (allBookmarks.length === 0) {
    console.error("No se encontraron marcadores");
    process.exit(1);
  }

  const rows = allBookmarks.map((b) => ({
    user_id: userId,
    title: b.title,
    url: b.url,
    description: b.description || null,
    tags: b.tags,
  }));

  const { data, error } = await supabase.from("bookmarks").upsert(rows, {
  });

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
  console.log(`Subidos ${rows.length} marcadores a Supabase`);
}

main();
