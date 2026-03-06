#!/usr/bin/env node
/**
 * Divide bookmarks.json en archivos separados por carpeta.
 * Crea src/data/bookmarks/{slug}.json para cada carpeta raíz.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const INPUT = join(ROOT, 'src/data/bookmarks.json');
const OUTPUT_DIR = join(ROOT, 'src/data/bookmarks');

let data;
try {
  data = JSON.parse(readFileSync(INPUT, 'utf-8'));
} catch (e) {
  console.error(`No se encontró ${INPUT}. Este script es para migrar desde el formato antiguo.`);
  console.error('Si ya usas src/data/bookmarks/, ejecuta: pnpm sync');
  process.exit(1);
}
mkdirSync(OUTPUT_DIR, { recursive: true });

const slugs = [];
for (const folder of data.folders) {
  const slug = folder.slug || folder.name.toLowerCase().replace(/\s+/g, '-');
  slugs.push(slug);
  writeFileSync(
    join(OUTPUT_DIR, `${slug}.json`),
    JSON.stringify(folder, null, 2),
    'utf-8'
  );
}

// index.json: lista de carpetas en orden
writeFileSync(
  join(OUTPUT_DIR, 'index.json'),
  JSON.stringify({ folders: slugs, allLinks: data.allLinks || [] }, null, 2),
  'utf-8'
);

console.log(`Dividido en ${slugs.length} archivos en ${OUTPUT_DIR}`);
console.log('Carpetas:', slugs.join(', '));
