// @ts-check
import { rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';

// Pages that exist only for local work and tests. They never ship.
const devPages = ['styleguide', 'docs/test'];
const includeDevPages = process.env.INCLUDE_DEV_PAGES === 'true';

/** @type {import('astro').AstroIntegration} */
const stripDevPages = {
	name: 'dygo:strip-dev-pages',
	hooks: {
		'astro:build:done': async ({ dir }) => {
			if (includeDevPages) return;
			for (const page of devPages) {
				await rm(new URL(`${page}/`, dir), { recursive: true, force: true });
			}
		},
	},
};

export default defineConfig({
	site: 'https://dygoframework.com',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'Dygo',
			customCss: ['./src/styles/starlight.css'],
			components: {
				ThemeProvider: './src/components/docs/ThemeProvider.astro',
				ThemeSelect: './src/components/docs/ThemeSelect.astro',
			},
		}),
		sitemap({
			filter: (page) => !devPages.some((p) => new URL(page).pathname.startsWith(`/${p}/`)),
		}),
		stripDevPages,
	],
});
