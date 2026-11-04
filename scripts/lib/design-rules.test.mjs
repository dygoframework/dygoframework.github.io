import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findViolations } from './design-rules.mjs';

test('allows tokens in inline styles', () => {
	assert.deepEqual(findViolations('src/components/ui/A.astro', '<span style="background: var(--dy-color-bg)"></span>'), []);
});

test('flags a raw hex color in a page style attribute', () => {
	const found = findViolations('src/pages/index.astro', '---\n---\n<div style="color: #ff0000">Hi</div>');
	assert.equal(found.length, 1);
	assert.equal(found[0].line, 3);
	assert.match(found[0].message, /Raw color/);
});

test('flags rgb() in an SVG fill and a template style', () => {
	const found = findViolations('src/components/ui/A.astro', '<path fill="rgb(1 2 3)" /><b style={`color: rgba(0,0,0,.5)`} />');
	assert.equal(found.length, 2);
});

test('flags CSS inside a page', () => {
	const found = findViolations('src/pages/about.astro', '<p>Hi</p>\n<style>p { margin: 0 }</style>');
	assert.equal(found.length, 1);
	assert.match(found[0].message, /Pages must not contain CSS/);
});

test('allows CSS inside a component', () => {
	assert.deepEqual(findViolations('src/components/ui/A.astro', '<style>p { margin: 0 }</style>'), []);
});

test('flags an unapproved font in an inline style', () => {
	const found = findViolations('src/components/ui/A.astro', '<p style="font-family: Inter, sans-serif">Hi</p>');
	assert.equal(found.length, 1);
	assert.match(found[0].message, /Unapproved font/);
});

test('allows a token font in an inline style', () => {
	assert.deepEqual(findViolations('src/components/ui/A.astro', '<p style="font-family: var(--dy-font-mono)">Hi</p>'), []);
});

test('flags a raw color in a data file', () => {
	assert.equal(findViolations('src/data/home.ts', "export const accent = '#FFD400';").length, 1);
	assert.equal(findViolations('src/data/home.ts', "export const tint = 'rgba(255, 212, 0, 0.1)';").length, 1);
});

test('ignores anchors in data files', () => {
	assert.deepEqual(findViolations('src/data/nav.ts', "export const href = '#security';"), []);
});

test('skips tokens.css and generated files', () => {
	assert.deepEqual(findViolations('src/styles/tokens.css', ':root { --a: #fff; }'), []);
	assert.deepEqual(findViolations('src/generated/x.ts', "const c = '#fff';"), []);
});
