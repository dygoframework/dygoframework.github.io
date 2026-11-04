import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPage, fixPaths, render, rewriteLinks } from './sync.mjs';

const files = {
	'docs/guide.md': '# Guide\n\nIntro.\n\n## Alpha\n\nSee [beta](#beta) and [other](other.md#gamma).\n\n### Alpha detail\n\nText.\n\n## Beta\n\nB. [Code](../app.go), [examples](../examples/), [plan](phase-1.md).\n',
	'docs/other.md': '# Other\n\nO.\n\n## Gamma\n\nG [back](guide.md).\n',
};
const read = (f) => files[f];
const readLocal = () => '---\ntitle: x\n---\n\nLocal page.\n';
const options = {
	fileHomes: { 'docs/guide.md': '/docs/alpha/' },
	excluded: [/^docs\/phase-/],
	ref: 'main',
	exists: (f) => f === 'app.go',
	isDir: (f) => f === 'examples',
};

test('one section drops its heading and lifts its subsections', () => {
	const page = buildPage({ href: '/docs/alpha/', title: 'Alpha' }, [{ file: 'docs/guide.md', sections: ['Alpha'] }], read, readLocal, 'main');
	assert.equal(page.lines[0], 'See [beta](#beta) and [other](other.md#gamma).');
	assert.ok(page.lines.includes('## Alpha detail'));
	assert.equal(page.anchors.get('docs/guide.md#alpha'), '');
	assert.equal(page.anchors.get('docs/guide.md#alpha-detail'), 'alpha-detail');
	assert.equal(page.editUrl, 'https://github.com/dygoframework/dygo/edit/main/docs/guide.md');
});

test('several sections keep their headings, except one that repeats the title', () => {
	const page = buildPage({ href: '/docs/x/', title: 'Alpha' }, [{ file: 'docs/guide.md', sections: ['Alpha', 'Beta'] }], read, readLocal, 'main');
	assert.ok(!page.lines.includes('## Alpha'));
	assert.ok(page.lines.includes('## Beta'));
	assert.equal(page.anchors.get('docs/guide.md#beta'), 'beta');
});

test('a whole file keeps its sections, and heading: true nests it', () => {
	const page = buildPage({ href: '/docs/o/', title: 'O' }, [{ file: 'docs/other.md', heading: true }], read, readLocal, 'main');
	assert.deepEqual(page.lines.slice(0, 4), ['## Other', '', 'O.', '']);
	assert.ok(page.lines.includes('### Gamma'));
	assert.equal(page.anchors.get('docs/other.md'), '');
});

test('a local page uses its body and an edit link to this repo', () => {
	const page = buildPage({ href: '/docs/l/', title: 'L' }, [{ local: 'l.md' }], read, readLocal, 'main');
	assert.deepEqual(page.lines, ['Local page.']);
	assert.match(page.editUrl, /dygoframework\.github\.io\/edit\/main\/src\/content\/docs-pages\/l\.md$/);
});

test('rewrites links to pages, anchors and GitHub', () => {
	const alpha = buildPage({ href: '/docs/alpha/', title: 'Alpha' }, [{ file: 'docs/guide.md', sections: ['Alpha'] }], read, readLocal, 'main');
	const beta = buildPage({ href: '/docs/beta/', title: 'Beta' }, [{ file: 'docs/guide.md', sections: ['Beta'] }], read, readLocal, 'main');
	const other = buildPage({ href: '/docs/other/', title: 'Other' }, [{ file: 'docs/other.md' }], read, readLocal, 'main');
	const pages = [alpha, beta, other];
	assert.deepEqual(pages.flatMap((p) => rewriteLinks(p, pages, options)), []);
	assert.equal(alpha.lines[0], 'See [beta](/docs/beta/) and [other](/docs/other/#gamma).');
	assert.equal(
		beta.lines[0],
		'B. [Code](https://github.com/dygoframework/dygo/blob/main/app.go), [examples](https://github.com/dygoframework/dygo/tree/main/examples/), [plan](https://github.com/dygoframework/dygo/blob/main/docs/phase-1.md).',
	);
	assert.ok(other.lines.includes('G [back](/docs/alpha/).'));
});

test('reports links that point nowhere and leaves code alone', () => {
	const page = { href: '/docs/p/', title: 'P', files: ['docs/guide.md'], anchors: new Map(), editUrl: '', lines: ['[x](missing.md)', '```', '[y](missing.md)', '```', '[z](../../out.txt)', '[w](https://x.dev) `Get[T](ref)`'] };
	assert.deepEqual(rewriteLinks(page, [page], options), ['/docs/p/: missing.md', '/docs/p/: ../../out.txt']);
	assert.equal(page.lines[2], '[y](missing.md)');
	assert.equal(page.lines[5], '[w](https://x.dev) `Get[T](ref)`');
});

test('removes the old module path everywhere', () => {
	assert.equal(fixPaths('go get github.com/dygoacademy/dygo'), 'go get github.com/dygoframework/dygo');
	const note = 'the module path is now `github.com/dygoframework/dygo` (it was\n  `github.com/dygoacademy/dygo`), and the same';
	assert.equal(fixPaths(note), 'the module path is now `github.com/dygoframework/dygo`, and the same');
});

test('renders frontmatter with neighbors and a description', () => {
	const page = { title: 'A "q"', editUrl: 'https://e', lines: ['Hello there.'] };
	const out = render(page, { prev: { href: '/docs/p/', title: 'P' } });
	assert.equal(out, '---\ntitle: "A \\"q\\""\ndescription: "Hello there."\neditUrl: "https://e"\nprev:\n  link: "/docs/p/"\n  label: "P"\nnext: false\n---\n\nHello there.\n');
	assert.match(render({ title: 'T', editUrl: '', lines: ['```', 'x', '```'] }, {}), /description: "T in the Dygo framework docs."/);
});
