/**
 * Clasifica marcadores localmente (sin API) usando reglas basadas en section, título y URL.
 * Lee bookmarks-export.json y genera SQL para actualizar.
 *
 * Uso: tsx scripts/classify-bookmarks-local.ts
 */
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string | null;
  section?: string;
  tags?: string[];
};

function getHost(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

function classify(b: Bookmark): { theme: string; subtheme: string; tags: string[] } {
  const title = (b.title || "").toLowerCase();
  const url = b.url || "";
  const host = getHost(url);
  const section = (b.section || "").toLowerCase().replace(/-/g, " ");
  const existingTags = b.tags || [];

  let theme = "General";
  let subtheme = "Otros";
  const tags = new Set<string>();

  for (const t of existingTags) {
    if (t && t.toLowerCase() !== "herrramientas" && t !== "Others") {
      tags.add(t.trim());
    }
  }

  const sectionMap: Record<string, [string, string]> = {
    apps: ["Productividad", "Aplicaciones"],
    herrramientas: ["Herramientas", "Desarrollo"],
    "desarrollo-web": ["Desarrollo", "Web"],
    "user interface": ["Diseño", "UI"],
    learning: ["Aprendizaje", "Educación"],
    typing: ["Aprendizaje", "Mecanografía"],
    hacking: ["Seguridad", "Pentesting"],
    shorcuts: ["Productividad", "Atajos"],
    others: ["General", "Utilidades"],
    edition: ["Multimedia", "Edición"],
    "perfiles-git-web": ["Portfolios", "Desarrollo"],
  };

  const sec = section.replace(/\s/g, "-").replace("desarrollo web", "desarrollo-web");
  if (sectionMap[sec]) {
    [theme, subtheme] = sectionMap[sec];
  }

  if (host.includes("github.com")) {
    theme = "Desarrollo";
    subtheme = "Git";
    tags.add("git").add("código");
  } else if (host.includes("youtube.com") || host.includes("youtu.be")) {
    if (title.includes("react") || title.includes("javascript") || title.includes("tutorial") || title.includes("curso")) {
      theme = "Aprendizaje";
      subtheme = "Desarrollo";
      tags.add("video").add("tutorial");
    } else if (title.includes("karate") || title.includes("patadas")) {
      theme = "Aprendizaje";
      subtheme = "Deportes";
      tags.add("video").add("karate");
    } else {
      theme = "Entretenimiento";
      subtheme = "Video";
      tags.add("video");
    }
  } else if (host.includes("npmjs.com") || host.includes("npm.org")) {
    theme = "Desarrollo";
    subtheme = "Librerías";
    tags.add("npm").add("javascript");
  } else if (host.includes("figma.com") || host.includes("figma")) {
    theme = "Diseño";
    subtheme = "UI";
    tags.add("diseño").add("figma");
  } else if (host.includes("vercel.app") || host.includes("netlify")) {
    theme = "Desarrollo";
    subtheme = "Hosting";
    tags.add("deploy").add("frontend");
  } else if (host.includes("x.com") || host.includes("twitter.com")) {
    theme = "Redes";
    subtheme = "Social";
    tags.add("twitter");
  } else if (host.includes("amazon") || host.includes("mercado")) {
    theme = "Compras";
    subtheme = "E-commerce";
    tags.add("compras");
  } else if (host.includes("adobe.com") || host.includes("acrobat")) {
    theme = "Productividad";
    subtheme = "Documentos";
    tags.add("pdf").add("adobe");
  } else if (host.includes("emojipedia")) {
    theme = "Referencia";
    subtheme = "Emojis";
    tags.add("emojis").add("referencia");
  } else if (host.includes("10fastfingers") || host.includes("agilefingers")) {
    theme = "Aprendizaje";
    subtheme = "Mecanografía";
    tags.add("typing").add("práctica");
  } else if (host.includes("overthewire") || host.includes("bandit")) {
    theme = "Seguridad";
    subtheme = "Pentesting";
    tags.add("ctf").add("hacking");
  } else if (host.includes("awwwards") || host.includes("dribbble")) {
    theme = "Diseño";
    subtheme = "Inspiración";
    tags.add("diseño").add("ui");
  } else if (host.includes("animista") || host.includes("animejs")) {
    theme = "Diseño";
    subtheme = "Animación";
    tags.add("css").add("animación");
  } else if (host.includes("bgjar") || host.includes("haikei") || host.includes("blob")) {
    theme = "Diseño";
    subtheme = "SVG/Fondos";
    tags.add("svg").add("diseño");
  } else if (host.includes("bentogrids")) {
    theme = "Diseño";
    subtheme = "Layout";
    tags.add("css").add("grid");
  } else if (title.includes("react") || title.includes("vue") || title.includes("angular") || title.includes("next")) {
    theme = "Desarrollo";
    subtheme = "Frontend";
    tags.add("frontend").add("javascript");
  } else if (title.includes("css") || title.includes("tailwind") || title.includes("styl")) {
    theme = "Desarrollo";
    subtheme = "Estilos";
    tags.add("css").add("frontend");
  } else if (title.includes("portfolio") || title.includes("portafolio")) {
    theme = "Portfolios";
    subtheme = "Desarrollo";
    tags.add("portfolio").add("frontend");
  } else if (title.includes("prueba técnica") || title.includes("entrevista")) {
    theme = "Aprendizaje";
    subtheme = "Empleo";
    tags.add("react").add("tutorial");
  } else if (title.includes("ia") || title.includes("ai ") || title.includes(" artificial")) {
    theme = "Herramientas";
    subtheme = "IA";
    tags.add("ia").add("automatización");
  } else if (title.includes("svg") || title.includes("icon")) {
    theme = "Diseño";
    subtheme = "Iconos";
    tags.add("svg").add("iconos");
  } else if (title.includes("code block") || title.includes("syntax")) {
    theme = "Desarrollo";
    subtheme = "Componentes";
    tags.add("react").add("ui");
  } else if (title.includes("upload") || title.includes("file")) {
    theme = "Desarrollo";
    subtheme = "Componentes";
    tags.add("react").add("upload");
  } else if (title.includes("audio") || title.includes("sound")) {
    theme = "Desarrollo";
    subtheme = "Multimedia";
    tags.add("react").add("audio");
  } else if (title.includes("axios") || title.includes("fetch")) {
    theme = "Desarrollo";
    subtheme = "HTTP";
    tags.add("javascript").add("api");
  } else if (title.includes("bash") || title.includes("zsh") || title.includes("terminal")) {
    theme = "Productividad";
    subtheme = "Terminal";
    tags.add("terminal").add("shell");
  } else if (title.includes("cheatsheet") || title.includes("atajo")) {
    theme = "Productividad";
    subtheme = "Atajos";
    tags.add("referencia").add("atajos");
  } else if (title.includes("bbc") || title.includes("english") || title.includes("learning")) {
    theme = "Aprendizaje";
    subtheme = "Idiomas";
    tags.add("inglés").add("idiomas");
  } else if (title.includes("clippy") || title.includes("clip-path")) {
    theme = "Diseño";
    subtheme = "CSS";
    tags.add("css").add("clip-path");
  } else if (title.includes("watch") && title.includes("movie")) {
    theme = "Entretenimiento";
    subtheme = "Streaming";
    tags.add("películas").add("video");
  }

  if (section === "herrramientas" && theme === "Herramientas") {
    if (title.includes("react") || host.includes("github") || host.includes("npm")) {
      theme = "Desarrollo";
      subtheme = "Herramientas";
    }
  }

  const tagList = Array.from(tags);
  if (tagList.length === 0) {
    tagList.push(subtheme.toLowerCase(), theme.toLowerCase());
  }

  return {
    theme,
    subtheme,
    tags: tagList.slice(0, 5),
  };
}

function escapeSql(s: string): string {
  return s.replace(/'/g, "''");
}

function main() {
  const data = JSON.parse(
    readFileSync(join(process.cwd(), "bookmarks-export.json"), "utf-8")
  ) as Bookmark[];

  const updates: string[] = [];
  const now = new Date().toISOString();

  for (const b of data) {
    const { theme, subtheme, tags } = classify(b);
    const tagsSql = `ARRAY[${tags.map((t) => `'${escapeSql(t)}'`).join(", ")}]::text[]`;
    updates.push(
      `UPDATE bookmarks SET theme = '${escapeSql(theme)}', subtheme = '${escapeSql(subtheme)}', tags = ${tagsSql}, updated_at = '${now}' WHERE id = '${b.id}';`
    );
  }

  const sql = `-- Clasificación automática de ${data.length} marcadores
-- Ejecutar en Supabase > SQL Editor

${updates.join("\n")}
`;

  const outPath = join(process.cwd(), "bookmarks-classified.sql");
  writeFileSync(outPath, sql, "utf-8");
  console.log(`Generado ${outPath} con ${data.length} UPDATEs`);
}

main();
