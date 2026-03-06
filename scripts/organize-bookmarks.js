#!/usr/bin/env node
/**
 * Organiza bookmarks: añade descripciones y reorganiza por temáticas.
 * Ejecutar: node scripts/organize-bookmarks.js
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BOOKMARKS_DIR = join(__dirname, '..', 'src/data/bookmarks');

// Descripciones por URL (dominio o patrón) o por título
const DESCRIPTIONS = {
  // perfiles-git-web
  'github.com/NoHaxito': 'Perfil GitHub de No Haxito',
  'github.com/NoHaxito/portfolio': 'Portfolio en GitHub',
  'deloriancs.github.io': 'Portfolio personal',
  'guchihacker.github.io': 'Portfolio personal',
  'pheralb.dev': 'Portfolio de Pablo Herrera',
  'lanzt.github.io': 'Portfolio de Lanz',
  'pylonet.gitbook.io': 'Notas en GitBook',
  '0xnotkyo.gitbook.io': 'Notas en GitBook',
  'gzzcoo.com': 'Portfolio web',
  'selfdreamer.github.io': 'Portfolio personal',
  'github.com/SelfDreamer': 'Perfil GitHub',
  'blog.gzzcoo.com': 'Blog personal',
  'its-yayo.github.io': 'Portfolio de Yayo',
  'fernando-herrera.com': 'Curso de Next.js',
  'alesis-portfolio.vercel.app': 'Portfolio de Alesis',
  'juniorencode.dev': 'Portfolio de Junior',
  'cristianorrego.dev': 'Portfolio de Cristian Orrego',

  // desarrollo-web
  'frontendmentor.io': 'Desafíos frontend para practicar',
  'cssbattle.dev': 'Juegos de CSS para practicar',
  'cssgridgarden.com': 'Aprende CSS Grid jugando',
  'flexboxfroggy.com': 'Aprende Flexbox jugando',
  'linkedin.com': 'Perfil LinkedIn',
  'cursoreact.dev': 'Curso de React',
  'developer.mozilla.org': 'Documentación web MDN',
  'tailwindcss.com': 'Bloques UI de Tailwind',
  'tympanus.net': 'Blog de recursos y tutoriales',
  'vercel.com': 'Plataforma de despliegue',
  'netlify.com': 'Despliegue rápido por drag & drop',
  'opengraph.xyz': 'Previsualizar meta tags Open Graph',
  'alg0.dev': 'Visualización de algoritmos',

  // user-interface
  'colorhunt.co': 'Paletas de colores',
  'icons0.dev': 'Iconos SVG gratuitos',
  'icon-icons.com': 'Iconos gratuitos',
  'heroicons.com': 'Iconos de Heroicons',
  'fontawesome.com': 'Biblioteca de iconos',
  'svgrepo.com': 'Iconos SVG gratuitos',
  'remixicon.com': 'Iconos open source',
  'boxicons.com': 'Iconos Boxicons',
  'tablericons.com': 'Iconos Tabler',
  'cssmatic.com': 'Generador de box-shadow',
  'cssgrid-generator.netlify.app': 'Generador de CSS Grid',
  'bennettfeely.com': 'Generador de clip-path CSS',
  'cssgradient.io': 'Generador de gradientes CSS',
  'joshwcomeau.com': 'Generador de gradientes',
  'animista.net': 'Animaciones CSS',
  'lottiefiles.com': 'Animaciones Lottie',
  'jitter.video': 'Generador de videos animados',
  'animejs.com': 'Biblioteca de animaciones JS',
  'efecto.app': 'Efectos visuales',
  'svgwave.in': 'Generador de ondas SVG',
  'svgwaves.io': 'Generador de ondas SVG',
  'getwaves.io': 'Generador de ondas SVG',
  'haikei.app': 'Generador de formas SVG',
  'transition.style': 'Transiciones CSS',
  'bgjar.com': 'Generador de fondos SVG',
  'pattern.monster': 'Patrones SVG',
  'heropatterns.com': 'Patrones de fondo',
  'templatemonster.com': 'Plantillas gratuitas',
  'github.com/hiaaryan/sileo': 'Sistema de notificaciones toast',
  'blobmaker.app': 'Generador de formas blob',
  'svgbackgrounds.com': 'Fondos SVG',
  'neumorphism.io': 'Generador de neumorphism',
  'creative-tim.com': 'Componentes Tailwind',
  'ui.shadcn.com': 'Componentes UI copy-paste',
  'reactbits.dev': 'Componentes React',
  'uiverse.io': 'Componentes UI gratuitos',
  'flowbite.com': 'Componentes Tailwind',
  'material-tailwind.com': 'Material Design con Tailwind',
  'magicui.design': 'Componentes UI animados',
  'stitch.withgoogle.com': 'Herramientas de diseño Google',
  'bentogrids.com': 'Inspiración Bento Grid',
  'landingfolio.com': 'Inspiración de landings',
  'scroll-driven-animations.style': 'Animaciones con scroll',
  'awwwards.com': 'Premios de diseño web',
  'carrd.co': 'Constructor de páginas one-page',

  // others
  'rendercv.com': 'Generador de CV en LaTeX',
  'coolors.co': 'Generador de paletas de colores',
  'emojipedia.org': 'Referencia de emojis',
  'fonts.google.com': 'Catálogo de fuentes Google',
  'medium.com': 'Consejos de diseño UI',
  'pagespeed.web.dev': 'Análisis de rendimiento web',
  'verdent.ai': 'Herramientas de IA',
  'axios': 'Cliente HTTP para JavaScript',
  'github.com/vercel/geist-font': 'Fuente Geist de Vercel',
  'fffuel.co': 'Herramientas SVG y diseño',
  'ui.aceternity.com': 'Componentes UI animados',
  'shadertoy.com': 'Shaders y efectos WebGL',
  'sparkjs.dev': 'Efectos shader para web',
  'github.com/UnSetSoft/Ryunixjs': 'Framework JavaScript',
  'github.com/mishamyrt/Lilex': 'Fuente monoespaciada',
  'github.com/pheralb': 'Perfil GitHub de Pablo',
};

function getDescription(link) {
  const url = (link.url || '').replace(/^https?:\/\//, '').split('/')[0];
  const fullUrl = (link.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '');
  for (const [key, desc] of Object.entries(DESCRIPTIONS)) {
    if (fullUrl.includes(key) || url.includes(key)) return desc;
  }
  // Fallback por dominio
  const domain = url.replace(/^www\./, '');
  if (domain.includes('github')) return 'Repositorio o perfil en GitHub';
  if (domain.includes('youtube')) return 'Tutorial o video en YouTube';
  if (domain.includes('vercel')) return 'Proyecto desplegado en Vercel';
  if (domain.includes('codepen')) return 'Demo o snippet en CodePen';
  if (domain.includes('x.com') || domain.includes('twitter')) return 'Publicación en X/Twitter';
  return null;
}

function addDescriptions(obj) {
  if (obj.links) {
    obj.links = obj.links.map((l) => {
      const desc = getDescription(l);
      return { ...l, ...(desc && { description: desc }) };
    });
  }
  obj.children?.forEach(addDescriptions);
  return obj;
}

// Categorías para others.json
const OTHERS_CATEGORIES = {
  'CV y currículum': [
    'rendercv.com',
  ],
  'Colores': [
    'coolors.co',
  ],
  'Fuentes': [
    'fonts.google.com',
    'github.com/vercel/geist-font',
    'github.com/mishamyrt/Lilex',
  ],
  'Emojis': [
    'emojipedia.org',
  ],
  'Diseño y consejos': [
    'medium.com',
  ],
  'Performance': [
    'pagespeed.web.dev',
  ],
  'IA': [
    'verdent.ai',
  ],
  'Librerías': [
    'github.com/axios',
  ],
  'Componentes UI': [
    'ui.aceternity.com',
  ],
  'Shaders y efectos': [
    'shadertoy.com',
    'sparkjs.dev',
  ],
  'Herramientas SVG': [
    'fffuel.co',
  ],
  'Portfolios': [
    'portafolio-chi-teal-79.vercel.app',
    'github.com/pheralb',
  ],
};

function categorizeOthers(links) {
  const seen = new Set();
  const categorized = {};
  for (const [cat, patterns] of Object.entries(OTHERS_CATEGORIES)) {
    categorized[cat] = [];
    for (const link of links) {
      const url = (link.url || '').replace(/^https?:\/\//, '');
      if (seen.has(link.url)) continue;
      for (const p of patterns) {
        if (url.includes(p)) {
          categorized[cat].push(link);
          seen.add(link.url);
          break;
        }
      }
    }
  }
  categorized['Otros'] = links.filter((l) => !seen.has(l.url));
  return categorized;
}

// Categorías para herrramientas.json
const HERR_CATEGORIES = {
  'Tutoriales y cursos': ['youtube.com', 'bootcamp.manz.dev', 'web.dev'],
  'Portfolios': ['vercel.app', 'github.com/FraVelz', 'jeraidi.dev', 'codex.centaury.net', 'santiagogoncalvez.com', 'edev.online', 'gabo-fullstack', 'github.com/GaboInsane6489'],
  'Componentes UI': ['diceui', 'sileo.aaryan', 'code-blocks.pheralb', 'tremor.so', 'skiper-ui.com', 'warcraftcn.com', 'audio-ui.xyz', 'flowbite.com', 'daisyui.com', 'reactbits.dev', 'thegridcn.com', 'better-upload.com', 'selia.earth', 'vengenceui.com', 'starwind.dev', 'ui.todovue.blog', 'goey-toast', 'awesomeshadcn.dev'],
  'Colores': ['uicolors.app', 'tailawesome.com'],
  'Iconos': ['pixeliconlibrary.com', '1042.studio', 'itshover'],
  'Documentación': ['devdocs.io', 'nextra.site', 'docs.ultracite.ai', 'ui.elevenlabs.io'],
  'Formularios': ['formisch'],
  'Traducción': ['translate.google', 'github.com/nehu3n/trad'],
  'IA': ['iscreen.live', 'readdy.ai', 'agentation.dev', 'anara.com', 'prompt.always200', 'puckeditor.com'],
  'Blogs y recursos': ['blog.deephacking.tech', 'el-rincon-del-front-end', 'overreacted.io', 'shud.in', 'web-dev-resources.com'],
  'Desarrollo': ['next-auth.js.org', 'errore.org', 'github.com/open-circle/formisch', 'originmap.net', 'dev-workflows.com', 'sher.sh'],
  'Inspiración': ['bentogrids.com', 'focusclimb.app'],
  'Otros': [],
};

function categorizeHerr(links) {
  const seen = new Set();
  const categorized = {};
  for (const [cat, patterns] of Object.entries(HERR_CATEGORIES)) {
    categorized[cat] = cat === 'Otros' ? [] : [];
    if (cat === 'Otros') continue;
    for (const link of links) {
      const url = (link.url || '').toLowerCase();
      const title = (link.title || '').toLowerCase();
      if (seen.has(link.url)) continue;
      for (const p of patterns) {
        if (url.includes(p) || title.includes(p)) {
          categorized[cat].push(link);
          seen.add(link.url);
          break;
        }
      }
    }
  }
  categorized['Otros'] = links.filter((l) => !seen.has(l.url));
  return categorized;
}

function buildFolder(name, slug, links) {
  return {
    type: 'folder',
    name,
    slug: slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    children: [],
    links: links || [],
  };
}

function main() {
  // 1. perfiles-git-web: añadir descripciones y subcategorías
  const perfiles = JSON.parse(readFileSync(join(BOOKMARKS_DIR, 'perfiles-git-web.json'), 'utf8'));
  const perfilesCats = {
    'Portfolios': [],
    'GitBook y notas': [],
    'Blogs': [],
    'Cursos': [],
  };
  for (const l of perfiles.links) {
    const url = (l.url || '').toLowerCase();
    if (url.includes('gitbook.io') || url.includes('pylonet')) perfilesCats['GitBook y notas'].push(l);
    else if (url.includes('blog.')) perfilesCats['Blogs'].push(l);
    else if (url.includes('fernando-herrera.com')) perfilesCats['Cursos'].push(l);
    else perfilesCats['Portfolios'].push(l);
  }
  perfiles.children = [
    buildFolder('Portfolios', 'portfolios', perfilesCats['Portfolios'].map((l) => ({ ...l, description: getDescription(l) || 'Portfolio o perfil de desarrollador' }))),
    buildFolder('GitBook y notas', 'gitbook-notas', perfilesCats['GitBook y notas'].map((l) => ({ ...l, description: getDescription(l) || 'Notas y documentación' }))),
    buildFolder('Blogs', 'blogs', perfilesCats['Blogs'].map((l) => ({ ...l, description: getDescription(l) || 'Blog personal' }))),
    buildFolder('Cursos', 'cursos', perfilesCats['Cursos'].map((l) => ({ ...l, description: getDescription(l) || 'Curso de desarrollo' }))),
  ].filter((f) => f.links.length > 0);
  perfiles.links = [];
  writeFileSync(join(BOOKMARKS_DIR, 'perfiles-git-web.json'), JSON.stringify(perfiles, null, 2));

  // 2. desarrollo-web: solo añadir descripciones
  const desarrollo = JSON.parse(readFileSync(join(BOOKMARKS_DIR, 'desarrollo-web.json'), 'utf8'));
  addDescriptions(desarrollo);
  writeFileSync(join(BOOKMARKS_DIR, 'desarrollo-web.json'), JSON.stringify(desarrollo, null, 2));

  // 3. user-interface: añadir descripciones, quitar duplicado CssGradient
  const ui = JSON.parse(readFileSync(join(BOOKMARKS_DIR, 'user-interface.json'), 'utf8'));
  const seenUrls = new Set();
  const dedupe = (arr) => arr.filter((l) => {
    if (seenUrls.has(l.url)) return false;
    seenUrls.add(l.url);
    return true;
  });
  ui.children?.forEach((c) => {
    c.links = dedupe(c.links || []);
    c.links = c.links.map((l) => ({ ...l, description: getDescription(l) || '' })).filter((l) => l.description || l.title);
  });
  addDescriptions(ui);
  writeFileSync(join(BOOKMARKS_DIR, 'user-interface.json'), JSON.stringify(ui, null, 2));

  // 4. others: reorganizar por categorías, quitar duplicados
  const others = JSON.parse(readFileSync(join(BOOKMARKS_DIR, 'others.json'), 'utf8'));
  // Si ya está procesado (links vacío), recoger de children para re-ejecuciones
  let othersLinks = others.links?.length ? others.links : [];
  if (othersLinks.length === 0 && others.children?.length) {
    othersLinks = others.children.flatMap((c) => c.links || []);
  }
  othersLinks = othersLinks.filter((l, i, arr) => arr.findIndex((x) => x.url === l.url) === i);
  const othersCats = categorizeOthers(othersLinks);
  others.children = Object.entries(othersCats)
    .filter(([, links]) => links.length > 0)
    .map(([name, links]) => buildFolder(name, slugify(name), links.map((l) => ({ ...l, description: getDescription(l) || '' }))));
  others.links = [];
  writeFileSync(join(BOOKMARKS_DIR, 'others.json'), JSON.stringify(others, null, 2));

  // 5. herrramientas: reorganizar por categorías
  const herr = JSON.parse(readFileSync(join(BOOKMARKS_DIR, 'herrramientas.json'), 'utf8'));
  let herrLinks = [...(herr.links || [])];
  if (herrLinks.length === 0 && herr.children?.length) {
    // Excluir hijos preservados (ej. Documenttacion Github IA) para evitar duplicados
    const preserveNames = ['Documenttacion Github IA'];
    herrLinks = herr.children.flatMap((c) =>
      preserveNames.includes(c.name) ? [] : (c.links || []));
  }
  const herrCats = categorizeHerr(herrLinks);
  const herrChildren = Object.entries(herrCats)
    .filter(([, links]) => links.length > 0)
    .map(([name, links]) => buildFolder(name, slugify(name), links.map((l) => ({ ...l, description: getDescription(l) || '' }))));
  herr.children = [...(herr.children || []), ...herrChildren];
  herr.links = [];
  writeFileSync(join(BOOKMARKS_DIR, 'herrramientas.json'), JSON.stringify(herr, null, 2));

  console.log('✓ Bookmarks organizados con descripciones y categorías.');
}

main();
