// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Carga sidebar con conteos: "{n} - {nombre}" */
function getSidebar() {
	const path = join(__dirname, 'src/data/sidebar-nav.json');
	if (!existsSync(path)) {
		return [
			{ label: 'Inicio', slug: 'index' },
			{ label: 'Apps', slug: 'apps' },
			{ label: 'Learning', slug: 'learning' },
			{ label: 'Edition', slug: 'edition' },
			{ label: 'Typing', slug: 'typing' },
			{ label: 'Hacking', slug: 'hacking' },
			{ label: 'Perfiles Git', slug: 'perfiles-git-web' },
			{ label: 'Desarrollo WEB', slug: 'desarrollo-web' },
			{ label: 'User Interface', slug: 'user-interface' },
			{ label: 'Atajos', slug: 'shorcuts' },
			{ label: 'Otros', slug: 'others' },
			{ label: 'Herramientas', slug: 'herrramientas' },
		];
	}
	const items = JSON.parse(readFileSync(path, 'utf-8'));
	return items.map(({ label, slug, count }) => ({
		label: count != null ? `${count} - ${label}` : label,
		slug,
	}));
}

// https://astro.build/config
export default defineConfig({
	site: 'https://marcadores.example.com',
	integrations: [
		starlight({
			title: 'Marcadores - Documentación',
			description: 'Recursos y enlaces organizados por categorías',
			customCss: ['./src/styles/custom.css'],
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/FraVelz/' }],
			sidebar: getSidebar(),
		}),
	],
});
