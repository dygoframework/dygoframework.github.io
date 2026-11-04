// Fails when a file under src/ breaks a design rule from DESIGN.md.
import { readFile, readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { findViolations } from './lib/design-rules.mjs';

const root = new URL('..', import.meta.url).pathname;

async function* walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) yield* walk(path);
		else yield path;
	}
}

let failures = 0;
for await (const path of walk(join(root, 'src'))) {
	const file = relative(root, path).split(sep).join('/');
	for (const { line, message } of findViolations(file, await readFile(path, 'utf8'))) {
		console.error(`${file}:${line} ${message}`);
		failures++;
	}
}

if (failures) {
	console.error(`\n${failures} design rule problem(s). See DESIGN.md.`);
	process.exit(1);
}
console.log('Design rules pass.');
