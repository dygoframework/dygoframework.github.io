// Fails when the Dygo docs have a guide or a section that the docs menu
// doesn't cover. Add the page to src/data/navigation.ts,
// scripts/lib/docs-manifest.mjs and design/docs-menu-map.md, or list it in
// `notInMenu` with a reason.
//
//   DOCS_SOURCE=../com.dygoframework npm run check:menu
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { excluded, manifest, notInMenu } from './lib/docs-manifest.mjs';
import { mapProblems, uncovered } from './lib/coverage.mjs';
import { docsNav } from '../src/data/navigation.ts';

const source = process.env.DOCS_SOURCE;
if (!source) {
	console.error('Set DOCS_SOURCE to a Dygo checkout.');
	process.exit(2);
}

/** Markdown files under docs/, as paths relative to the checkout. */
function list(dir) {
	return readdirSync(join(source, dir), { withFileTypes: true }).flatMap((entry) => {
		const path = `${dir}/${entry.name}`;
		if (entry.isDirectory()) return list(path);
		return entry.name.endsWith('.md') ? [path] : [];
	});
}

const map = readFileSync(new URL('../design/docs-menu-map.md', import.meta.url), 'utf8');
const problems = [
	...uncovered(list('docs').sort(), (file) => readFileSync(join(source, file), 'utf8'), { manifest, excluded, notInMenu }),
	...mapProblems(map, docsNav),
];
if (problems.length) {
	console.error(`The docs menu misses ${problems.length} part(s) of the Dygo docs:\n${problems.map((p) => `  ${p}`).join('\n')}`);
	console.error('\nAdd them to the menu (see design/docs-menu-map.md), or to notInMenu in scripts/lib/docs-manifest.mjs.');
	process.exit(1);
}
console.log('The docs menu covers every Dygo guide and section.');
