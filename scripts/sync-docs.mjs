// Syncs the docs from the Dygo repo into src/content/docs/docs/.
//
//   DOCS_SOURCE=../dygo-framework npm run sync-docs   # use a local checkout
//   DOCS_REF=v1.0.0 npm run sync-docs                 # clone a ref (default: main)
//
// The output is the same every time for the same input.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { docsNav } from '../src/data/navigation.ts';
import { excluded, fileHomes, manifest } from './lib/docs-manifest.mjs';
import { buildPage, render, repoUrl, rewriteLinks } from './lib/sync.mjs';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'src/content/docs/docs');
const local = join(root, 'src/content/docs-pages');
const ref = process.env.DOCS_REF || 'main';

// `--if-missing` (used before every build) syncs only when nothing was synced yet.
if (process.argv.includes('--if-missing') && existsSync(join(root, 'src/generated/docs.json'))) process.exit(0);

function checkout() {
	if (process.env.DOCS_SOURCE) return process.env.DOCS_SOURCE;
	const dir = mkdtempSync(join(tmpdir(), 'dygo-docs-'));
	execFileSync('git', ['clone', '--quiet', '--filter=blob:none', `${repoUrl}.git`, dir], { stdio: 'inherit' });
	execFileSync('git', ['-C', dir, 'checkout', '--quiet', ref], { stdio: 'inherit' });
	return dir;
}

/** The newest root module tag reachable from the checkout, like v1.0.0-beta.1. */
function latestTag(dir) {
	try {
		const tags = execFileSync('git', ['-C', dir, 'tag', '--merged', 'HEAD', '--sort=-v:refname', '--list', 'v*'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
		return tags.split('\n').find((tag) => /^v\d/.test(tag));
	} catch {
		return undefined;
	}
}

const source = checkout();
const read = (/** @type {string} */ file) => readFileSync(join(source, file), 'utf8');
const readLocal = (/** @type {string} */ file) => readFileSync(join(local, file), 'utf8');
const exists = (/** @type {string} */ file) => existsSync(join(source, file));
const isDir = (/** @type {string} */ file) => exists(file) && statSync(join(source, file)).isDirectory();

const navPages = docsNav.flatMap((g) => g.items.filter((i) => i.href).map((i) => ({ href: /** @type {string} */ (i.href), title: i.label })));
const missing = navPages.filter((p) => !manifest[p.href]);
const extra = Object.keys(manifest).filter((href) => !navPages.some((p) => p.href === href));
if (missing.length || extra.length) {
	throw new Error(`Menu and manifest differ. Missing: ${missing.map((p) => p.href).join(', ')} Extra: ${extra.join(', ')}`);
}

const pages = navPages.map((nav) => buildPage(nav, manifest[nav.href], read, readLocal, ref));
const problems = pages.flatMap((page) => rewriteLinks(page, pages, { fileHomes, excluded, ref, exists, isDir }));
if (problems.length) throw new Error(`Links that point nowhere:\n${problems.join('\n')}`);

// Start clean, but keep the fixed test page.
for (const entry of existsSync(out) ? readdirSync(out) : []) {
	if (entry !== 'test') rmSync(join(out, entry), { recursive: true, force: true });
}
pages.forEach((page, i) => {
	const path = page.href === '/docs/' ? 'index.md' : `${page.href.replace(/^\/docs\//, '').replace(/\/$/, '')}.md`;
	const file = join(out, path);
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, render(page, { prev: navPages[i - 1], next: navPages[i + 1] }));
});

const version = latestTag(source);
mkdirSync(join(root, 'src/generated'), { recursive: true });
writeFileSync(join(root, 'src/generated/docs.json'), `${JSON.stringify({ ref, version: version ?? null }, null, 2)}\n`);

if (!process.env.DOCS_SOURCE) rmSync(source, { recursive: true, force: true });
console.log(`Synced ${pages.length} docs pages from ${ref}${version ? ` (${version})` : ''}.`);
