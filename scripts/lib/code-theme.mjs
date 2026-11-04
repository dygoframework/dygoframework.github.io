// Builds the Expressive Code theme and frame plugin from tokens.css, so code
// colors stay defined in one place.
import { readFileSync } from 'node:fs';

/** @param {string} css */
export function readTokens(css) {
	/** @type {Record<string, string>} */
	const tokens = {};
	for (const [, name, value] of css.matchAll(/(--dy-[\w-]+)\s*:\s*([^;]+);/g)) tokens[name] = value.trim();
	return tokens;
}

/** @param {string | URL} tokensPath */
export function loadTokens(tokensPath) {
	return readTokens(readFileSync(tokensPath, 'utf8'));
}

/** @param {Record<string, string>} t */
export function codeTheme(t) {
	const need = (/** @type {string} */ name) => {
		if (!t[name]) throw new Error(`Missing token ${name} in tokens.css`);
		return t[name];
	};
	return {
		name: 'dygo',
		type: 'dark',
		colors: {
			'editor.background': need('--dy-color-surface-code'),
			'editor.foreground': need('--dy-color-code-text'),
		},
		tokenColors: [
			{ settings: { foreground: need('--dy-color-code-text') } },
			{ scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: need('--dy-color-code-comment') } },
			{ scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'], settings: { foreground: need('--dy-color-code-keyword') } },
			{ scope: ['string', 'string.quoted', 'string.template', 'punctuation.definition.string'], settings: { foreground: need('--dy-color-code-string') } },
			{ scope: ['entity.name.function', 'support.function', 'meta.function-call', 'variable.function'], settings: { foreground: need('--dy-color-code-function') } },
		],
	};
}

const shellLanguages = new Set(['bash', 'sh', 'shell', 'shellscript', 'zsh', 'console', 'powershell']);

/** @param {any} node @param {(n: any) => boolean} test @returns {any} */
function find(node, test) {
	if (test(node)) return node;
	for (const child of node.children ?? []) {
		const hit = find(child, test);
		if (hit) return hit;
	}
	return undefined;
}

/**
 * Every block gets an editor frame. Shell blocks are titled "Terminal", and the
 * header shows the language on the right, as in the design. The code can take
 * keyboard focus, because long lines scroll.
 */
export function framePlugin() {
	return {
		name: 'dygo-frames',
		hooks: {
			preprocessMetadata: (/** @type {any} */ { codeBlock }) => {
				if (!codeBlock.props.title && shellLanguages.has(codeBlock.language)) codeBlock.props.title = 'Terminal';
				codeBlock.props.frame = 'code';
			},
			postprocessRenderedBlock: (/** @type {any} */ { codeBlock, renderData }) => {
				// Long lines scroll, so keyboard users must be able to focus the code.
				const pre = find(renderData.blockAst, (n) => n.tagName === 'pre');
				if (pre) pre.properties = { ...pre.properties, tabIndex: 0 };
				const caption = find(renderData.blockAst, (n) => n.tagName === 'figcaption');
				if (!caption || !codeBlock.props.title) return;
				caption.children.push({
					type: 'element',
					tagName: 'span',
					properties: { className: ['dy-code-lang'] },
					children: [{ type: 'text', value: codeBlock.language }],
				});
			},
		},
	};
}
