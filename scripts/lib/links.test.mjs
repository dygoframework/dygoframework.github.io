import { test } from 'node:test';
import assert from 'node:assert/strict';
import { brokenLinks, ids, links } from './links.mjs';

test('reads ids and links, skipping scripts', () => {
	assert.deepEqual([...ids('<h2 id="a">A</h2><p id="b">')], ['a', 'b']);
	assert.deepEqual(links('<a href="/x/">x</a><script>"<a href=\\"/y/\\">"</script><a class="c" href="#a&amp;b">'), ['/x/', '#a&b']);
});

test('passes good links and files', () => {
	const pages = new Map([
		['/', '<a href="/docs/#install">d</a><a href="/favicon.svg">f</a><a href="https://example.com">e</a>'],
		['/docs/', '<h2 id="install">Install</h2><a href="#_top">top</a><a href="../">home</a>'],
	]);
	assert.deepEqual(brokenLinks(pages, (p) => p === '/favicon.svg'), []);
});

test('reports a missing page and a missing anchor', () => {
	const pages = new Map([['/', '<a href="/nope/">x</a><a href="/#missing">y</a>']]);
	assert.deepEqual(brokenLinks(pages, () => false), ['/ links to /nope/: no such page', '/ links to /#missing: no such anchor']);
});
