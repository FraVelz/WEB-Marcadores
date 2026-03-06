#!/usr/bin/env node
/**
 * Genera archivos MDX para Starlight desde bookmarks.json
 * - Un solo archivo por categoría principal (subtemas como H2/H3)
 * - Iconos con carga diferida (lazy) por sección
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_PATH = join(ROOT, 'src/data/bookmarks.json');
const DOCS_PATH = join(ROOT, 'src/content/docs');

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function escapeMd(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'));
}

function getFaviconUrl(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=32`;
  } catch {
    return '';
  }
}

function formatLink(l, useIcon = true) {
  const domain = l.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const favicon = useIcon ? getFaviconUrl(l.url) : '';
  const iconHtml = favicon
    ? `<img src="${favicon}" alt="" width="16" height="16" loading="lazy" decoding="async" style="vertical-align: middle; margin-right: 6px;" />`
    : '';
  return `- ${iconHtml}[**${escapeMd(l.title)}**](${l.url}) — \`${domain}\``;
}

/** Genera el contenido MDX de una carpeta (recursivo, sin crear archivos hijos) */
function buildFolderContent(folder, headingLevel = 2) {
  const sections = [];
  const h = '#'.repeat(headingLevel);

  // Links directos de esta carpeta
  if (folder.links?.length > 0) {
    if (headingLevel === 2) {
      sections.push(`${h} Enlaces\n`);
    }
    sections.push(folder.links.map((l) => formatLink(l)).join('\n'));
  }

  // Subcarpetas como subsecciones (H2, H3...) en el mismo archivo
  folder.children?.forEach((child) => {
    const hasChildContent = child.links?.length > 0 || child.children?.length > 0;
    if (!hasChildContent) return;

    sections.push(`\n${h} ${child.name}\n`);
    sections.push(buildFolderContent(child, headingLevel + 1));
  });

  return sections.join('\n');
}

/** Cuenta enlaces recursivamente en una carpeta */
function countLinks(folder) {
  let n = folder.links?.length ?? 0;
  folder.children?.forEach((c) => (n += countLinks(c)));
  return n;
}

/** Genera datos del sidebar con conteo para la navegación */
function buildSidebarData(folders) {
  const items = [{ label: 'Inicio', slug: 'index', count: null }];
  folders.forEach((f) => {
    const hasContent = f.links?.length > 0 || f.children?.length > 0;
    if (!hasContent) return;
    const slug = slugify(f.name);
    const count = countLinks(f);
    items.push({ label: f.name, slug, count });
  });
  return items;
}

/** Genera UN solo archivo por categoría raíz */
function generateTopLevelFolder(folder) {
  const slug = slugify(folder.name);
  const hasContent = folder.links?.length > 0 || folder.children?.length > 0;
  if (!hasContent) return;

  const content = buildFolderContent(folder);

  const mdx = `---
title: ${folder.name}
description: Recursos y enlaces de ${folder.name}
---

${content}
`;

  const dirPath = join(DOCS_PATH, slug);
  mkdirSync(dirPath, { recursive: true });
  writeFileSync(join(dirPath, 'index.mdx'), mdx, 'utf-8');
}

// Ejecutar
const data = JSON.parse(readFileSync(DATA_PATH, 'utf-8'));

// Limpiar docs (excepto index)
try {
  const entries = readdirSync(DOCS_PATH);
  for (const e of entries) {
    if (e !== 'index.mdx') {
      rmSync(join(DOCS_PATH, e), { recursive: true });
    }
  }
} catch {}

for (const folder of data.folders) {
  generateTopLevelFolder(folder);
}

// Generar sidebar-nav.json para la barra de navegación con conteos
const sidebarData = buildSidebarData(data.folders);
const SIDEBAR_PATH = join(ROOT, 'src/data/sidebar-nav.json');
writeFileSync(SIDEBAR_PATH, JSON.stringify(sidebarData, null, 2), 'utf-8');

console.log('Documentación generada en', DOCS_PATH);
console.log('Sidebar con conteos:', SIDEBAR_PATH);
