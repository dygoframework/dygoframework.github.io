import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uncovered } from './coverage.mjs';

const files = {
	'docs/whole.md': '# Whole\n\n## A\n\nText.\n',
	'docs/split.md': '# Split\n\n## One\n\nText.\n\n### Detail\n\n## Two\n\nText.\n\n## Skipped\n\nText.\n',
	'docs/phase-1.md': '# Plan\n',
};
const rules = {
	manifest: { '/docs/a/': [{ file: 'docs/whole.md' }], '/docs/b/': [{ file: 'docs/split.md', sections: ['One', 'Two'] }] },
	excluded: [/^docs\/phase-/],
	notInMenu: { 'docs/split.md': ['Skipped'] },
};
const read = (f) => files[f] ?? '';

test('everything is covered by a page, an exclusion or notInMenu', () => {
	assert.deepEqual(uncovered(Object.keys(files), read, rules), []);
});

test('a new guide fails until it is in the menu', () => {
	const withNew = { ...files, 'docs/guide-new.md': '# New\n\n## Start\n' };
	assert.deepEqual(uncovered(Object.keys(withNew), (f) => withNew[f], rules), ['docs/guide-new.md: no menu page uses this file']);
});

test('a new section in a split guide fails, but a new subsection does not', () => {
	const changed = { ...files, 'docs/split.md': `${files['docs/split.md']}\n## Three\n\n### Deep\n` };
	assert.deepEqual(uncovered(Object.keys(changed), (f) => changed[f], rules), ['docs/split.md: "Three" is in no menu page']);
});

test('the menu map must list each menu page in its group', async () => {
	const { mapProblems } = await import('./coverage.mjs');
	const map = '# Map\n\n## Overview\n\n| Menu item | Source |\n|---|---|\n| Introduction | x |\n\n## AI\n\n| Menu item | Source |\n|---|---|\n| Old page | x |\n';
	const nav = [
		{ title: 'Overview', items: [{ label: 'Introduction', href: '/docs/' }, { label: 'Later', soon: true }] },
		{ title: 'AI', items: [{ label: 'Typed output', href: '/docs/ai/typed-output/' }] },
	];
	assert.deepEqual(mapProblems(map, nav), ['docs-menu-map.md: AI misses "Typed output"', 'docs-menu-map.md: AI lists "Old page", which isn\'t in the menu']);
});
