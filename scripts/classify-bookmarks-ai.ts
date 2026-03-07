/**
 * Clasifica marcadores con IA (OpenAI): asigna tema, subtema y tags.
 *
 * Uso: pnpm run classify:ai
 *
 * Requiere en .env.local:
 *   OPENAI_API_KEY=sk-...
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *
 * Opcional: SUPABASE_SERVICE_ROLE_KEY para bypass RLS
 */
import { createClient } from "@supabase/supabase-js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!OPENAI_API_KEY || !SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Faltan variables: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, (SUPABASE_SERVICE_ROLE_KEY o NEXT_PUBLIC_SUPABASE_ANON_KEY)"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

type Classification = {
  theme: string;
  subtheme: string;
  tags: string[];
};

async function classifyBookmark(
  title: string,
  url: string,
  description?: string | null
): Promise<Classification> {
  const prompt = `Clasifica este marcador web. Devuelve SOLO un JSON válido, sin markdown ni explicaciones, con esta estructura exacta:
{"theme":"Tema principal (ej: Desarrollo, Herramientas, Documentación, Diseño, Productividad)","subtheme":"Subtema más específico (ej: Frontend, Backend, CSS, Git)","tags":["tag1","tag2","tag3"]}

Reglas:
- theme y subtheme en español, una o dos palabras
- tags: 2-5 etiquetas en minúsculas, relevantes para el contenido
- Si no hay contexto suficiente, infiere del título y URL

Marcador:
Título: ${title}
URL: ${url}
${description ? `Descripción: ${description}` : ""}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API: ${res.status} ${err}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Respuesta vacía de OpenAI");

  let parsed: Classification;
  try {
    const cleaned = content.replace(/^```json?\s*|\s*```$/g, "").trim();
    parsed = JSON.parse(cleaned) as Classification;
  } catch {
    throw new Error(`No se pudo parsear JSON: ${content.slice(0, 100)}`);
  }

  return {
    theme: String(parsed.theme || "General").trim(),
    subtheme: String(parsed.subtheme || "Otros").trim(),
    tags: Array.isArray(parsed.tags)
      ? parsed.tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
      : [],
  };
}

async function main() {
  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("id, title, url, description")
    .order("title");

  if (error) {
    console.error("Error al leer marcadores:", error.message);
    process.exit(1);
  }

  if (!bookmarks?.length) {
    console.log("No hay marcadores para clasificar.");
    return;
  }

  console.log(`Clasificando ${bookmarks.length} marcadores con IA...\n`);

  let updated = 0;
  for (const b of bookmarks) {
    try {
      const { theme, subtheme, tags } = await classifyBookmark(
        b.title,
        b.url,
        b.description
      );

      const { error: updError } = await supabase
        .from("bookmarks")
        .update({ theme, subtheme, tags, updated_at: new Date().toISOString() })
        .eq("id", b.id);

      if (updError) {
        console.error(`  ✗ ${b.title}: ${updError.message}`);
      } else {
        console.log(`  ✓ ${b.title} → ${theme} › ${subtheme} [${tags.join(", ")}]`);
        updated++;
      }
    } catch (err) {
      console.error(`  ✗ ${b.title}:`, err instanceof Error ? err.message : err);
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`\nListo. ${updated}/${bookmarks.length} marcadores actualizados.`);
}

main();
