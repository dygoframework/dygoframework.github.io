// Fails the build when an internal link or anchor in dist/ points nowhere.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { brokenLinks } from './lib/links.mjs';

const dist = new URL('../dist/', import.meta.url).pathname;
// Pages that are linked from the top bar but not built yet. Phase 4 builds
// /enterprise/; remove it from this list then.
const pending = new Set(['/enterprise/']);

/** @param {string} dir @returns {string[]} */
const walk = (dir) => readdirSync(dir).flatMap((name) => {
	const path = join(dir, name);
	return statSync(path).isDirectory() ? walk(path) : [path];
});

const pages = new Map();
for (const file of walk(dist).filter((f) => f.endsWith('.html'))) {
	const rel = `/${relative(dist, file).split(sep).join('/')}`;
	const path = rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel;
	pages.set(path, readFileSync(file, 'utf8'));
}

const problems = [...new Set(brokenLinks(pages, (path) => pending.has(path) || existsSync(join(dist, path))))];
if (problems.length) {
	console.error(problems.join('\n'));
	console.error(`\n${problems.length} broken link(s).`);
	process.exit(1);
}
console.log(`Links pass on ${pages.size} pages.`);
