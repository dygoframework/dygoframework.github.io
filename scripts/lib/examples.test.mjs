// Every Go block on a page written in this repo must appear word for word in
// tests/examples, where `go test` runs it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
const pagesDir = join(root, 'src/content/docs-pages');
const examplesDir = join(root, 'tests/examples');

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
const code = walk(examplesDir).filter((f) => f.endsWith('.go')).map((f) => readFileSync(f, 'utf8')).join('\n');

for (const page of walk(pagesDir).filter((f) => f.endsWith('.md'))) {
	test(`Go blocks in ${page.slice(pagesDir.length + 1)} are tested`, () => {
		const blocks = [...readFileSync(page, 'utf8').matchAll(/```go\n([\s\S]*?)```/g)].map((m) => m[1].trimEnd());
		assert.ok(blocks.length > 0, 'the page has a Go example');
		for (const block of blocks) assert.ok(code.includes(block), `not found in tests/examples:\n${block}`);
	});
}
