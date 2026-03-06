#!/usr/bin/env node
/**
 * Parsea bookmarks.html (Firefox/Netscape) y genera src/data/bookmarks/
 * Un archivo JSON por cada carpeta raíz.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BOOKMARKS_PATH = join(ROOT, 'bookmarks.html');
const OUTPUT_DIR = join(ROOT, 'src/data/bookmarks');

const IGNORE_FOLDERS = new Set(['Mozilla Firefox', 'Bookmarks Toolbar', '.........', 'Unfiled Bookmarks']);

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function parseBookmarks(html) {
  const result = { folders: [], allLinks: [] };
  const lines = html.split(/\r?\n/);
  let i = 0;

  function getIndent(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }

  function parseLevel(parentPath, minIndent) {
    const folders = [];
    const links = [];

    while (i < lines.length) {
      const line = lines[i];
      const indent = getIndent(line);
      if (indent < minIndent) break;

      const h3Match = line.match(/<DT><H3[^>]*>([^<]+)<\/H3>/);
      if (h3Match) {
        const name = h3Match[1].trim();
        i++;
        if (IGNORE_FOLDERS.has(name)) {
          if (i < lines.length && lines[i].includes('<DL>')) {
            i++;
            parseLevel([...parentPath, name], indent + 4);
          }
          continue;
        }
        const folder = { type: 'folder', name, slug: slugify(name), children: [], links: [] };
        folders.push(folder);
        if (i < lines.length && lines[i].includes('<DL>')) {
          i++;
          const nested = parseLevel([...parentPath, name], indent + 4);
          folder.children = nested.folders;
          folder.links = nested.links;
        }
        continue;
      }

      const aMatch = line.match(/<DT><A\s+HREF="([^"]+)"[^>]*>([^<]*)<\/A>/);
      if (aMatch) {
        const [, href, title] = aMatch;
        const link = { type: 'link', title: (title || new URL(href).hostname).trim(), url: href };
        links.push(link);
        result.allLinks.push({ ...link, path: parentPath.slice() });
        i++;
        continue;
      }

      if (line.includes('</DL>')) {
        if (indent <= minIndent - 4) break;
        i++;
        continue;
      }
      i++;
    }
    return { folders, links };
  }

  while (i < lines.length && !lines[i].includes('Bookmarks Toolbar')) i++;
  if (i < lines.length) i++;
  if (i < lines.length && lines[i].includes('<DL>')) i++;

  const root = parseLevel([], 0);
  result.folders = root.folders;
  return result;
}

const html = readFileSync(BOOKMARKS_PATH, 'utf-8');
const parsed = parseBookmarks(html);

mkdirSync(OUTPUT_DIR, { recursive: true });

const slugs = [];
for (const folder of parsed.folders) {
  const slug = folder.slug;
  slugs.push(slug);
  writeFileSync(
    join(OUTPUT_DIR, `${slug}.json`),
    JSON.stringify(folder, null, 2),
    'utf-8'
  );
}

writeFileSync(
  join(OUTPUT_DIR, 'index.json'),
  JSON.stringify({ folders: slugs, allLinks: parsed.allLinks }, null, 2),
  'utf-8'
);

console.log(`Parseados ${parsed.allLinks.length} marcadores`);
console.log(`${slugs.length} carpetas en ${OUTPUT_DIR}`);
