import { test } from 'node:test';
import assert from 'node:assert/strict';
import { codeTheme, framePlugin, loadTokens, readTokens } from './code-theme.mjs';

test('reads custom properties from CSS', () => {
	assert.deepEqual(readTokens(':root { --dy-a: #fff; --dy-b-c: 1px; }'), { '--dy-a': '#fff', '--dy-b-c': '1px' });
});

test('builds the theme from the real tokens', () => {
	const tokens = loadTokens(new URL('../../src/styles/tokens.css', import.meta.url));
	const theme = codeTheme(tokens);
	assert.equal(theme.colors['editor.background'], tokens['--dy-color-surface-code']);
	const keyword = theme.tokenColors.find((c) => c.scope?.includes('keyword'));
	assert.equal(keyword?.settings.foreground, tokens['--dy-color-code-keyword']);
});

test('fails when a code token is missing', () => {
	assert.throws(() => codeTheme({}), /Missing token --dy-color-surface-code/);
});

test('titles shell blocks "Terminal" and keeps other titles', () => {
	const { preprocessMetadata } = framePlugin().hooks;
	const shell = { language: 'bash', props: {} };
	preprocessMetadata({ codeBlock: shell });
	assert.deepEqual(shell.props, { title: 'Terminal', frame: 'code' });
	const go = { language: 'go', props: { title: 'main.go' } };
	preprocessMetadata({ codeBlock: go });
	assert.equal(go.props.title, 'main.go');
	const plain = { language: 'go', props: {} };
	preprocessMetadata({ codeBlock: plain });
	assert.equal(plain.props.title, undefined);
});

test('adds the language to the header', () => {
	const { postprocessRenderedBlock } = framePlugin().hooks;
	const caption = { type: 'element', tagName: 'figcaption', children: [] };
	const renderData = { blockAst: { type: 'element', tagName: 'figure', children: [{ type: 'element', tagName: 'div', children: [caption] }] } };
	postprocessRenderedBlock({ codeBlock: { language: 'go', props: { title: 'main.go' } }, renderData });
	assert.equal(caption.children[0].children[0].value, 'go');
});

test('leaves blocks without a header alone', () => {
	const { postprocessRenderedBlock } = framePlugin().hooks;
	const renderData = { blockAst: { type: 'element', tagName: 'figure', children: [] } };
	postprocessRenderedBlock({ codeBlock: { language: 'go', props: {} }, renderData });
	assert.deepEqual(renderData.blockAst.children, []);
});
