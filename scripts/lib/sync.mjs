// Builds the docs pages from a Dygo checkout. Pure functions: the caller reads
// and writes files, so the same input always gives the same output.
import { posix } from 'node:path';
import { convertAdmonitions, description, headingText, parse, section, shiftHeadings, slugger } from './markdown.mjs';

export const repoUrl = 'https://github.com/dygoframework/dygo';
export const siteRepoUrl = 'https://github.com/dygoframework/dygoframework.github.io';

/**
 * @typedef {{ href: string, title: string }} NavPage
 * @typedef {{ file?: string, local?: string, sections?: string[], heading?: boolean }} Source
 * @typedef {{ href: string, title: string, lines: string[], editUrl: string, anchors: Map<string, string>, files: string[] }} Page
 */

const trim = (lines) => {
	const out = [...lines];
	while (out.length && !out[0].trim()) out.shift();
	while (out.length && !out.at(-1).trim()) out.pop();
	return out;
};

/**
 * Puts one page together from its sources. `anchors` maps `file#slug` to the
 * anchor the heading has on this page ('' when the heading was dropped).
 * @param {NavPage} nav
 * @param {Source[]} sources
 * @param {(file: string) => string} read Reads a source file.
 * @param {(file: string) => string} readLocal Reads a file from src/content/docs-pages.
 * @param {string} ref The Dygo Git ref, for edit links.
 * @returns {Page}
 */
export function buildPage(nav, sources, read, readLocal, ref) {
	const lines = [];
	/** @type {Map<string, string>} */
	const anchors = new Map();
	const slug = slugger();
	const files = [];
	const totalSections = sources.reduce((n, s) => n + (s.sections?.length ?? (s.file ? 2 : 0)), 0);
	let editUrl = '';

	for (const source of sources) {
		if (source.local) {
			const text = readLocal(source.local).replace(/^---\n[\s\S]*?\n---\n/, '');
			lines.push(...trim(text.split('\n')), '');
			editUrl ||= `${siteRepoUrl}/edit/main/src/content/docs-pages/${source.local}`;
			continue;
		}
		const file = /** @type {string} */ (source.file);
		files.push(file);
		editUrl ||= `${repoUrl}/edit/${ref}/${file}`;
		const doc = parse(read(file));
		const fileSlug = (/** @type {string} */ text) => slugger()(text);

		if (source.sections) {
			for (const name of source.sections) {
				const s = section(doc, name, file);
				// A heading that only repeats the page title is dropped.
				const keep = totalSections > 1 && headingText(s.text) !== nav.title;
				if (keep) lines.push(`## ${s.text}`, '');
				// A kept heading becomes h2. A dropped one lets its subsections become h2.
				lines.push(...shiftHeadings(trim(s.lines.slice(1)), keep ? 2 - s.level : 1 - s.level), '');
				anchors.set(`${file}#${fileSlug(s.text)}`, keep ? s.text : '');
				for (const sub of parse(s.lines.join('\n')).sections) anchors.set(`${file}#${fileSlug(sub.text)}`, sub.text);
			}
		} else {
			const top = Math.min(2, ...doc.sections.map((x) => x.level));
			if (source.heading) lines.push(`## ${headingText(doc.title ?? nav.title)}`, '');
			const body = [...doc.intro, ...doc.sections.filter((x) => x.level === top).flatMap((x) => x.lines)];
			lines.push(...shiftHeadings(trim(body), (source.heading ? 3 : 2) - top), '');
			anchors.set(file, '');
			for (const x of doc.sections) anchors.set(`${file}#${fileSlug(x.text)}`, x.text);
		}
	}

	// Turn heading texts into the slugs Starlight gives them on this page.
	const pageSlugs = new Map();
	for (const line of convertAdmonitions(lines)) {
		const m = line.match(/^#{2,6}\s+(.*)$/);
		if (m && !pageSlugs.has(m[1])) pageSlugs.set(m[1], slug(m[1]));
	}
	for (const [key, text] of anchors) anchors.set(key, text ? (pageSlugs.get(text) ?? '') : '');

	return { href: nav.href, title: nav.title, lines: convertAdmonitions(trim(lines)), editUrl, anchors, files };
}

/**
 * Points every Markdown link at the right page, or at GitHub for files that
 * aren't published.
 * @param {Page} page
 * @param {Page[]} pages
 * @param {{ fileHomes: Record<string, string>, excluded: RegExp[], ref: string, exists: (file: string) => boolean, isDir: (file: string) => boolean }} options
 * @returns {string[]} Links that couldn't be resolved.
 */
export function rewriteLinks(page, pages, { fileHomes, excluded, ref, exists, isDir }) {
	const problems = [];
	const fromFile = page.files[0] ?? 'docs/index.md';
	const resolve = (/** @type {string} */ target, /** @type {string} */ base) => {
		const [path, hash = ''] = target.split('#');
		const file = path ? posix.normalize(posix.join(posix.dirname(base), path)) : base;
		if (!file.endsWith('.md')) {
			if (file.startsWith('..')) return null;
			const kind = isDir(file.replace(/\/$/, '')) ? 'tree' : 'blob';
			return `${repoUrl}/${kind}/${ref}/${file}${hash ? `#${hash}` : ''}`;
		}
		if (excluded.some((re) => re.test(file))) return `${repoUrl}/blob/${ref}/${file}${hash ? `#${hash}` : ''}`;
		if (hash) {
			for (const p of pages) {
				const anchor = p.anchors.get(`${file}#${hash}`);
				if (anchor !== undefined) return `${p.href}${anchor ? `#${anchor}` : ''}`;
			}
		}
		const home = fileHomes[file] ?? pages.find((p) => p.files.includes(file))?.href;
		if (home) return home;
		if (exists(file)) return `${repoUrl}/blob/${ref}/${file}`;
		return null;
	};

	let fence = false;
	page.lines = page.lines.map((line) => {
		if (/^\s*(```|~~~)/.test(line)) fence = !fence;
		if (fence) return line;
		// Links inside `inline code`, such as dygo.Get[T](ref), are code, not links.
		return line.split(/(`[^`]*`)/).map((part) => part.startsWith('`') ? part : part.replace(/\]\(([^)\s]+)(\s+"[^"]*")?\)/g, (all, target, title = '') => {
			if (/^(https?:|mailto:)/.test(target)) return all;
			if (target.startsWith('#')) {
				// Same-file anchors may now live on another page.
				const anchor = page.anchors.get(`${fromFile}${target}`);
				if (anchor !== undefined) return `](${anchor ? `#${anchor}` : '#_top'}${title})`;
				const elsewhere = resolve(target, fromFile);
				if (elsewhere && elsewhere !== fileHomes[fromFile]) return `](${elsewhere}${title})`;
				return all;
			}
			const url = resolve(target, fromFile);
			if (!url) {
				problems.push(`${page.href}: ${target}`);
				return all;
			}
			return `](${url}${title})`;
		})).join('');
	});
	return problems;
}

/**
 * Removes the old module path. The changelog's note about the move
 * ("(it was `github.com/dygoacademy/dygo`)") is dropped, and any other use
 * points at the new path.
 */
export function fixPaths(/** @type {string} */ text) {
	return text
		.replace(/\s*\(it was\s+`github\.com\/dygoacademy\/dygo`\)/g, '')
		.replace(/github\.com\/dygoacademy\/dygo/g, 'github.com/dygoframework/dygo');
}

/**
 * The final file: frontmatter and body.
 * @param {Page} page
 * @param {{ prev?: NavPage, next?: NavPage }} neighbors
 */
export function render(page, { prev, next }) {
	const body = fixPaths(page.lines.join('\n')).split('\n');
	const yaml = (/** @type {string} */ s) => JSON.stringify(s);
	const front = [
		'---',
		`title: ${yaml(page.title)}`,
		`description: ${yaml(description(body) || `${page.title} in Dygo, the secure-by-default web framework for Go.`)}`,
		`editUrl: ${yaml(page.editUrl)}`,
		prev ? `prev:\n  link: ${yaml(prev.href)}\n  label: ${yaml(prev.title)}` : 'prev: false',
		next ? `next:\n  link: ${yaml(next.href)}\n  label: ${yaml(next.title)}` : 'next: false',
		'---',
		'',
	];
	return `${[...front, ...body].join('\n').trimEnd()}\n`;
}
