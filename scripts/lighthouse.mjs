// Runs Lighthouse on Home, Enterprise and a docs page and fails below 95 for
// accessibility or SEO (PLAN.md phase 5). It builds the site for a local
// server first, so canonical URLs point at that server.
//   npm run test:lighthouse
import { spawn, spawnSync } from 'node:child_process';
import { chromium } from '@playwright/test';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

const base = 'http://127.0.0.1:4322';
const pages = ['/', '/enterprise/', '/docs/first-steps/'];
const minimum = 0.95;

const build = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', env: { ...process.env, SITE_URL: base } });
if (build.status !== 0) process.exit(build.status ?? 1);

const server = spawn('node', ['scripts/serve-dist.mjs'], { env: { ...process.env, PORT: '4322' }, stdio: 'ignore' });
await new Promise((resolve) => setTimeout(resolve, 500));
const chrome = await chromeLauncher.launch({
	chromePath: chromium.executablePath(),
	chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'],
});

let failed = false;
try {
	for (const path of pages) {
		for (const formFactor of ['mobile', 'desktop']) {
			const result = await lighthouse(`${base}${path}`, {
				port: chrome.port,
				onlyCategories: ['accessibility', 'seo'],
				formFactor,
				screenEmulation: formFactor === 'desktop' ? { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1 } : undefined,
				logLevel: 'error',
			});
			const { categories, audits } = result.lhr;
			const scores = Object.values(categories).map((c) => `${c.title} ${Math.round((c.score ?? 0) * 100)}`);
			console.log(`${path} (${formFactor}): ${scores.join(', ')}`);
			for (const category of Object.values(categories)) {
				if ((category.score ?? 0) < minimum) {
					failed = true;
					for (const ref of category.auditRefs) {
						const audit = audits[ref.id];
						if (ref.weight > 0 && audit.score !== null && audit.score < 1) console.log(`  failing: ${audit.id}: ${audit.title}`);
					}
				}
			}
		}
	}
} finally {
	await chrome.kill();
	server.kill();
}

if (failed) {
	console.error(`\nA score is under ${minimum * 100}.`);
	process.exit(1);
}
