// Markdown helpers for the docs sync. They work on lines and skip fenced
// code, so a `# comment` inside a code block is never read as a heading.
import GithubSlugger from 'github-slugger';

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;

/**
 * Lists the headings of a document, outside code fences.
 * @param {string[]} lines
 * @returns {{ index: number, level: number, text: string }[]}
 */
export function headings(lines) {
	const found = [];
	let fence = null;
	lines.forEach((line, index) => {
		const open = line.match(FENCE);
		if (open) {
			if (!fence) fence = open[1];
			else if (line.trim().startsWith(fence)) fence = null;
			return;
		}
		if (fence) return;
		const match = line.match(HEADING);
		if (match) found.push({ index, level: match[1].length, text: match[2] });
	});
	return found;
}

/** The plain text of a heading, as a slug would see it. */
export function headingText(text) {
	return text.replace(/`([^`]*)`/g, '$1').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
}

/**
 * Splits a document into its title, its intro (the text before the first
 * section) and its sections. A section runs until the next heading of the same
 * or a higher level.
 * @param {string} source
 */
export function parse(source) {
	const lines = source.replace(/\r\n/g, '\n').split('\n');
	const all = headings(lines);
	const h1 = all.find((h) => h.level === 1);
	const body = all.filter((h) => h !== h1);
	const sections = body.map((h, i) => {
		const next = body.slice(i + 1).find((n) => n.level <= h.level);
		return { level: h.level, text: h.text, lines: lines.slice(h.index, next ? next.index : lines.length) };
	});
	const introStart = h1 ? h1.index + 1 : 0;
	const introEnd = body.length ? body[0].index : lines.length;
	return { title: h1?.text, intro: lines.slice(introStart, introEnd), sections };
}

/**
 * Returns the section whose heading text matches `name`, or throws.
 * @param {ReturnType<typeof parse>} doc
 * @param {string} name
 * @param {string} file For the error message.
 */
export function section(doc, name, file) {
	const hit = doc.sections.find((s) => s.text === name || headingText(s.text) === name);
	if (!hit) throw new Error(`${file}: no heading "${name}". Headings: ${doc.sections.map((s) => s.text).join(' | ')}`);
	return hit;
}

/**
 * Moves every heading outside code fences by `by` levels, kept between 2 and 6.
 * @param {string[]} lines
 * @param {number} by
 */
export function shiftHeadings(lines, by) {
	if (by === 0) return lines;
	const out = [...lines];
	for (const h of headings(lines)) {
		const level = Math.min(6, Math.max(2, h.level + by));
		out[h.index] = `${'#'.repeat(level)} ${h.text}`;
	}
	return out;
}

/**
 * Turns MkDocs admonitions (`!!! note "Title"` and the indented block under
 * it) into Starlight asides. The docs render asides with the Hint component.
 * @param {string[]} lines
 */
export function convertAdmonitions(lines) {
	const out = [];
	for (let i = 0; i < lines.length; i++) {
		const match = lines[i].match(/^(!!!|\?\?\?\+?)\s+(\w+)(?:\s+"([^"]*)")?\s*$/);
		if (!match) {
			out.push(lines[i]);
			continue;
		}
		const kind = { tip: 'tip', hint: 'tip', warning: 'caution', caution: 'caution', danger: 'danger', error: 'danger' }[match[2].toLowerCase()] ?? 'note';
		const title = match[3] ?? match[2][0].toUpperCase() + match[2].slice(1).toLowerCase();
		const body = [];
		while (i + 1 < lines.length && (/^( {4}|\t)/.test(lines[i + 1]) || lines[i + 1].trim() === '')) {
			body.push(lines[++i].replace(/^( {4}|\t)/, ''));
		}
		while (body.length && body.at(-1).trim() === '') body.pop();
		out.push(`:::${kind}[${title}]`, ...body, ':::', '');
	}
	return out;
}

/** Slugs the way Starlight's headings do. */
export function slugger() {
	const s = new GithubSlugger();
	return (/** @type {string} */ text) => s.slug(headingText(text));
}

/**
 * The first prose paragraph as plain text, cut to a sentence under ~160 characters.
 * @param {string[]} lines
 */
export function description(lines) {
	let fence = false;
	const paragraph = [];
	for (const line of lines) {
		if (FENCE.test(line)) {
			fence = !fence;
			if (paragraph.length) break;
			continue;
		}
		if (fence) continue;
		const plain = line.trim();
		if (!plain) {
			if (paragraph.length) break;
			continue;
		}
		if (/^(#|\||[-*+] |\d+\. |:::|>|<)/.test(plain)) {
			if (paragraph.length) break;
			continue;
		}
		paragraph.push(plain);
	}
	const text = paragraph
		.join(' ')
		.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
		.replace(/[`*_]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	if (text.length <= 160) return text;
	const sentences = text.match(/[^.!?]+[.!?]+(\s|$)/g) ?? [];
	let cut = '';
	for (const s of sentences) {
		if ((cut + s).trim().length > 160) break;
		cut += s;
	}
	return (cut.trim() || `${text.slice(0, 157).replace(/\s+\S*$/, '')}…`).trim();
}
