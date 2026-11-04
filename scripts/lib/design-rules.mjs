// Design checks that Stylelint can't see: inline styles and SVG attributes in
// components and pages, raw colors in data files, and CSS inside pages.

const RAW_COLOR = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i;
const ATTRIBUTE = /\b(style|fill|stroke|color|stop-color)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([^`]*)`\})/gi;
const FONT_FAMILY = /font-family\s*:\s*([^;"'`]+)/i;

/**
 * @param {string} file Path relative to the repo root, with forward slashes.
 * @param {string} text File contents.
 * @returns {{ line: number, message: string }[]}
 */
export function findViolations(file, text) {
	/** @type {{ line: number, message: string }[]} */
	const found = [];
	const lineOf = (/** @type {number} */ index) => text.slice(0, index).split('\n').length;

	if (file === 'src/styles/tokens.css' || file.startsWith('src/generated/')) return found;

	if (file.startsWith('src/pages/') && file.endsWith('.astro')) {
		const style = text.search(/<style[\s>]/);
		if (style !== -1) found.push({ line: lineOf(style), message: 'Pages must not contain CSS. Put it in a component.' });
	}

	if (file.endsWith('.astro')) {
		for (const match of text.matchAll(ATTRIBUTE)) {
			const value = match[2] ?? match[3] ?? match[4] ?? '';
			if (RAW_COLOR.test(value)) {
				found.push({ line: lineOf(match.index), message: `Raw color in ${match[1]} attribute. Use a token from tokens.css.` });
			}
			const font = value.match(FONT_FAMILY);
			if (font && !/^var\(--dy-font-(sans|mono)\)$/.test(font[1].trim())) {
				found.push({ line: lineOf(match.index), message: 'Unapproved font. Use --dy-font-sans or --dy-font-mono.' });
			}
		}
	}

	if (/\.(ts|js|mjs)$/.test(file)) {
		const match = text.match(/['"`](#[0-9a-f]{3}(?:[0-9a-f]{3})?(?:[0-9a-f]{2})?|(?:rgba?|hsla?)\([^)]*\))['"`]/i);
		if (match) found.push({ line: lineOf(match.index ?? 0), message: 'Raw color in code. Use a token from tokens.css.' });
	}

	return found;
}
