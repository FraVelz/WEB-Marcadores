#!/usr/bin/env node
/**
 * Genera archivos MDX para Starlight desde src/data/bookmarks/
 * Lee un JSON por carpeta en lugar de un único bookmarks.json
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const BOOKMARKS_DIR = join(ROOT, 'src/data/bookmarks');
const DOCS_PATH = join(ROOT, 'src/content/docs');

const FOLDER_MAP = {
  'Perfiles-Git-Web': { displayName: 'Portfolios', slug: 'portfolios' },
  'Desarrollo-WEB': { displayName: 'Desarrollo Web', slug: 'desarrollo-web' },
  'User Interface': { displayName: 'Diseño UI', slug: 'diseno-ui' },
  Others: { displayName: 'Utilidades', slug: 'utilidades' },
  herrramientas: { displayName: 'Herramientas', slug: 'herramientas' },
  shorcuts: { displayName: 'Atajos', slug: 'atajos' },
};

const SIDEBAR_ORDER = [
  'index', 'apps', 'learning', 'edition', 'typing', 'hacking',
  'portfolios', 'desarrollo-web', 'diseno-ui', 'atajos', 'herramientas', 'utilidades',
];

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapeMd(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'));
}

function getFaviconUrl(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch { return ''; }
}

function formatLink(l) {
  const domain = l.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const favicon = getFaviconUrl(l.url);
  const iconHtml = favicon
    ? `<img src="${favicon}" alt="" width="16" height="16" loading="lazy" decoding="async" style="vertical-align: middle; margin-right: 6px;" />`
    : '';
  return `- ${iconHtml}[**${escapeMd(l.title)}**](${l.url}) — \`${domain}\``;
}

function buildFolderContent(folder, headingLevel = 2) {
  const sections = [];
  const h = '#'.repeat(headingLevel);
  if (folder.links?.length > 0) {
    if (headingLevel === 2) sections.push(`${h} Enlaces\n`);
    sections.push(folder.links.map((l) => formatLink(l)).join('\n'));
  }
  folder.children?.forEach((child) => {
    const hasChildContent = child.links?.length > 0 || child.children?.length > 0;
    if (!hasChildContent) return;
    sections.push(`\n${h} ${child.name}\n`);
    sections.push(buildFolderContent(child, headingLevel + 1));
  });
  return sections.join('\n');
}

function countLinks(folder) {
  let n = folder.links?.length ?? 0;
  folder.children?.forEach((c) => (n += countLinks(c)));
  return n;
}

function getFolderMeta(folderName) {
  const mapped = FOLDER_MAP[folderName];
  if (mapped) return { displayName: mapped.displayName, slug: mapped.slug };
  return { displayName: folderName, slug: slugify(folderName) };
}

/** Carga carpetas desde bookmarks/ */
function loadBookmarks() {
  const indexPath = join(BOOKMARKS_DIR, 'index.json');
  let index;
  try {
    index = JSON.parse(readFileSync(indexPath, 'utf-8'));
  } catch {
    throw new Error(`No se encontró ${indexPath}. Ejecuta: pnpm split o pnpm sync`);
  }
  const folders = [];
  for (const slug of index.folders || []) {
    const filePath = join(BOOKMARKS_DIR, `${slug}.json`);
    try {
      const folder = JSON.parse(readFileSync(filePath, 'utf-8'));
      folders.push(folder);
    } catch (e) {
      console.warn(`No se pudo cargar ${filePath}:`, e.message);
    }
  }
  return { folders, allLinks: index.allLinks || [] };
}

function buildSidebarData(folders) {
  const items = [{ label: 'Inicio', slug: 'index', count: null }];
  const slugOrder = new Map(SIDEBAR_ORDER.map((s, i) => [s, i]));
  folders.forEach((f) => {
    const hasContent = f.links?.length > 0 || f.children?.length > 0;
    if (!hasContent) return;
    const { displayName, slug } = getFolderMeta(f.name);
    items.push({ label: displayName, slug, count: countLinks(f) });
  });
  items.sort((a, b) => {
    const orderA = slugOrder.get(a.slug) ?? 999;
    const orderB = slugOrder.get(b.slug) ?? 999;
    return orderA - orderB;
  });
  return items;
}

function generateTopLevelFolder(folder) {
  const { displayName, slug } = getFolderMeta(folder.name);
  const hasContent = folder.links?.length > 0 || folder.children?.length > 0;
  if (!hasContent) return;
  const content = buildFolderContent(folder);
  const mdx = `---
title: ${displayName}
description: Recursos y enlaces de ${displayName}
---

${content}
`;
  const dirPath = join(DOCS_PATH, slug);
  mkdirSync(dirPath, { recursive: true });
  writeFileSync(join(dirPath, 'index.mdx'), mdx, 'utf-8');
}

const data = loadBookmarks();

try {
  const entries = readdirSync(DOCS_PATH);
  for (const e of entries) {
    if (e !== 'index.mdx') rmSync(join(DOCS_PATH, e), { recursive: true });
  }
} catch {}

for (const folder of data.folders) {
  generateTopLevelFolder(folder);
}

const sidebarData = buildSidebarData(data.folders);
writeFileSync(
  join(ROOT, 'src/data/sidebar-nav.json'),
  JSON.stringify(sidebarData, null, 2),
  'utf-8'
);

console.log('Documentación generada en', DOCS_PATH);
console.log('Sidebar:', join(ROOT, 'src/data/sidebar-nav.json'));
