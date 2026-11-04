// @ts-check
import { rm } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import sitemap from '@astrojs/sitemap';
import { checkEnv } from './scripts/lib/env.mjs';

checkEnv(process.env);

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
	// The Lighthouse check builds for its local server, so canonical URLs match.
	site: process.env.SITE_URL || 'https://dygoframework.com',
	trailingSlash: 'always',
	integrations: [
		starlight({
			title: 'Dygo',
			description: 'Docs for Dygo, a secure-by-default web framework for Go.',
			// The site has its own 404 page (src/pages/404.astro).
			disable404Route: true,
			favicon: '/favicon.svg',
			head: [
				{ tag: 'meta', attrs: { property: 'og:image', content: 'https://dygoframework.com/og.png' } },
				{ tag: 'meta', attrs: { property: 'og:image:width', content: '1280' } },
				{ tag: 'meta', attrs: { property: 'og:image:height', content: '640' } },
				{ tag: 'meta', attrs: { property: 'og:image:alt', content: 'Dygo: secure by default, fast by design.' } },
				{ tag: 'meta', attrs: { name: 'twitter:image', content: 'https://dygoframework.com/og.png' } },
				{ tag: 'link', attrs: { rel: 'icon', href: '/favicon-32.png', sizes: '32x32', type: 'image/png' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
			],
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
