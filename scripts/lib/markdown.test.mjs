import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertAdmonitions, description, headings, parse, section, shiftHeadings, slugger } from './markdown.mjs';

const doc = `# Guide: things

Intro text.

## First

One.

### Deeper

\`\`\`sh
# not a heading
\`\`\`

## Second \`code\`

Two.
`;

test('finds headings outside code fences', () => {
	const lines = doc.split('\n');
	assert.deepEqual(headings(lines).map((h) => h.text), ['Guide: things', 'First', 'Deeper', 'Second `code`']);
});

test('splits a document into title, intro and sections', () => {
	const parsed = parse(doc);
	assert.equal(parsed.title, 'Guide: things');
	assert.deepEqual(parsed.intro.filter(Boolean), ['Intro text.']);
	assert.equal(parsed.sections[0].text, 'First');
	assert.ok(parsed.sections[0].lines.includes('### Deeper'));
	assert.ok(!parsed.sections[0].lines.includes('## Second `code`'));
	assert.equal(parsed.sections[1].text, 'Deeper');
});

test('finds a section by plain heading text, or explains what exists', () => {
	const parsed = parse(doc);
	assert.equal(section(parsed, 'Second code', 'g.md').text, 'Second `code`');
	assert.throws(() => section(parsed, 'Missing', 'g.md'), /g.md: no heading "Missing". Headings: First \| Deeper/);
});

test('shifts headings but never above h2 or below h6, and skips code', () => {
	const lines = ['### A', '```', '# code', '```', '###### B'];
	assert.deepEqual(shiftHeadings(lines, -2), ['## A', '```', '# code', '```', '#### B']);
	assert.deepEqual(shiftHeadings(lines, 3), ['###### A', '```', '# code', '```', '###### B']);
	assert.equal(shiftHeadings(lines, 0), lines);
});

test('turns MkDocs admonitions into asides', () => {
	const lines = ['Text', '!!! warning "Careful"', '    Line one.', '', '    Line two.', '', 'After', '!!! note', '    Plain.'];
	assert.deepEqual(convertAdmonitions(lines), [
		'Text', ':::caution[Careful]', 'Line one.', '', 'Line two.', ':::', '', 'After', ':::note[Note]', 'Plain.', ':::', '',
	]);
});

test('slugs like Starlight, deduplicating repeats', () => {
	const slug = slugger();
	assert.equal(slug('Login at an identity provider (`-oidc`)'), 'login-at-an-identity-provider--oidc');
	assert.equal(slug('Testing'), 'testing');
	assert.equal(slug('Testing'), 'testing-1');
});

test('takes the first prose paragraph as the description', () => {
	assert.equal(description(['```go', 'x', '```', '', 'Use [links](a.md) and `code`.', 'Next line.', '', 'Later.']), 'Use links and code. Next line.');
	assert.equal(description(['| a |', '- item']), '');
	const long = `${'Word '.repeat(20).trim()}. ${'More '.repeat(30).trim()}.`;
	assert.equal(description([long]), `${'Word '.repeat(20).trim()}.`);
	const noStop = 'x'.repeat(200);
	assert.ok(description([noStop]).endsWith('…'));
});
