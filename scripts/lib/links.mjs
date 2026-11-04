// Finds broken internal links in the built site: a link to a page that wasn't
// built, or to an anchor that page doesn't have.

/** @param {string} html */
export function ids(html) {
	return new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
}

/** @param {string} html */
export function links(html) {
	// Skip the content of <script> and <template>, which aren't links.
	const clean = html.replace(/<(script|template)\b[\s\S]*?<\/\1>/g, '');
	return [...clean.matchAll(/<a\s[^>]*?href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, '&'));
}

/**
 * @param {Map<string, string>} pages URL path (like /docs/) to its HTML.
 * @param {(path: string) => boolean} fileExists For links to files such as /favicon.svg.
 * @returns {string[]}
 */
export function brokenLinks(pages, fileExists) {
	const anchors = new Map([...pages].map(([path, html]) => [path, ids(html)]));
	const problems = [];
	for (const [from, html] of pages) {
		for (const href of links(html)) {
			if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(href) || href.startsWith('//')) continue;
			const url = new URL(href, `https://dygoframework.com${from}`);
			const path = decodeURIComponent(url.pathname);
			const hash = decodeURIComponent(url.hash.slice(1));
			if (!anchors.has(path) && !fileExists(path)) {
				problems.push(`${from} links to ${href}: no such page`);
				continue;
			}
			if (hash && hash !== '_top' && anchors.has(path) && !anchors.get(path)?.has(hash)) {
				problems.push(`${from} links to ${href}: no such anchor`);
			}
		}
	}
	return problems;
}
