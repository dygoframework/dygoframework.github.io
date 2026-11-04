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
			customCss: ['./src/styles/starlight.css', './src/styles/docs.css'],
			components: {
				ContentPanel: './src/components/docs/ContentPanel.astro',
				Footer: './src/components/docs/Footer.astro',
				Header: './src/components/docs/Header.astro',
				PageFrame: './src/components/docs/PageFrame.astro',
				PageSidebar: './src/components/docs/PageSidebar.astro',
				PageTitle: './src/components/docs/PageTitle.astro',
				Search: './src/components/docs/Search.astro',
				ThemeProvider: './src/components/docs/ThemeProvider.astro',
				ThemeSelect: './src/components/docs/ThemeSelect.astro',
				TwoColumnContent: './src/components/docs/TwoColumnContent.astro',
			},
		}),
		sitemap({
			filter: (page) => !devPages.some((p) => new URL(page).pathname.startsWith(`/${p}/`)),
		}),
		stripDevPages,
	],
});
