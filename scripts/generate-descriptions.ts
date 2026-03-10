/**
 * Genera descripciones y tags con OpenAI para marcadores del usuario fravelz.
 * Solo OpenAI (sin meta tags). Descripciones en español. Ritmo lento para evitar rate limits.
 *
 * Uso: pnpm run descriptions:generate
 *       pnpm run descriptions:generate -- --force  # sobrescribir todas
 *
 * Requiere: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !OPENAI_API_KEY) {
  console.error(
    "Faltan: OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DELAY_MS = 2500; // Pausa entre peticiones para no saturar la API

type AIResult = { description: string; tags: string[] };

async function generateWithAI(
  title: string,
  url: string
): Promise<AIResult | null> {
  const prompt = `Para este marcador web, genera en ESPAÑOL:
1. description: una descripción clara y breve (1-3 frases, máx 200 caracteres) que explique de qué trata el enlace para un usuario. Debe ser comprensible y útil.
2. tags: array de 2-5 etiquetas en minúsculas, relevantes para buscar/filtrar.

Devuelve SOLO un JSON válido, sin markdown:
{"description":"...","tags":["tag1","tag2",...]}

Título: ${title}
URL: ${url}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 200,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`    API: ${res.status} ${err.slice(0, 100)}`);
      return null;
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;

    const cleaned = content.replace(/^```json?\s*|\s*```$/g, "").trim();
    const parsed = JSON.parse(cleaned) as AIResult;

    return {
      description: String(parsed.description || "").trim().slice(0, 500),
      tags: Array.isArray(parsed.tags)
        ? parsed.tags
            .map((t) => String(t).trim().toLowerCase())
            .filter(Boolean)
            .slice(0, 8)
        : [],
    };
  } catch (e) {
    console.error(`    Error:`, e instanceof Error ? e.message : e);
    return null;
  }
}

async function main() {
  const { data } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });
  const user = data?.users?.find((u) =>
    u.email?.toLowerCase().includes("fravelz")
  );
  if (!user) {
    console.error("No se encontró usuario con email que contenga 'fravelz'");
    process.exit(1);
  }

  console.log(`Usuario: ${user.email}\n`);
  console.log(
    `Pausa de ${DELAY_MS / 1000}s entre peticiones para evitar bloqueos.\n`
  );

  const { data: bookmarks, error } = await supabase
    .from("bookmarks")
    .select("id, title, url, description, tags")
    .eq("user_id", user.id)
    .order("title");

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  if (!bookmarks?.length) {
    console.log("No hay marcadores.");
    return;
  }

  const force = process.argv.includes("--force");
  const toProcess = force
    ? bookmarks
    : bookmarks.filter(
        (b) => !b.description || String(b.description).trim() === ""
      );

  if (toProcess.length === 0) {
    console.log(
      force
        ? "No hay marcadores."
        : "Todos los marcadores ya tienen descripción. Usa --force para sobrescribir."
    );
    return;
  }

  console.log(
    `Procesando ${toProcess.length} marcadores${force ? " (--force)" : " sin descripción"}...\n`
  );

  let updated = 0;
  for (let i = 0; i < toProcess.length; i++) {
    const b = toProcess[i];
    const num = i + 1;
    process.stdout.write(`  [${num}/${toProcess.length}] ${b.title.slice(0, 50)}... `);

    const ai = await generateWithAI(b.title, b.url);

    if (ai && ai.description) {
      const existingTags = Array.isArray(b.tags) ? b.tags : [];
      const newTags =
        ai.tags.length > 0
          ? [...new Set([...existingTags, ...ai.tags])]
          : existingTags;

      const { error: updError } = await supabase
        .from("bookmarks")
        .update({
          description: ai.description,
          tags: newTags,
          updated_at: new Date().toISOString(),
        })
        .eq("id", b.id);

      if (updError) {
        console.log(`✗ ${updError.message}`);
      } else {
        console.log(`✓`);
        const preview =
          ai.description.length > 60
            ? ai.description.slice(0, 57) + "..."
            : ai.description;
        console.log(`    ${preview}`);
        if (ai.tags.length) console.log(`    tags: ${ai.tags.join(", ")}`);
        updated++;
      }
    } else {
      console.log("○ sin respuesta");
    }

    if (i < toProcess.length - 1) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  console.log(`\nListo. ${updated}/${toProcess.length} actualizados.`);
}

main();
