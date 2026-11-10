// Finds Dygo docs that the docs menu doesn't cover, so a new guide or a new
// section in a guide can't slip by. Pure: the caller lists and reads files.
import { parse } from './markdown.mjs';

/**
 * @param {string[]} files Markdown files of the Dygo checkout, like docs/guide-ai.md.
 * @param {(file: string) => string} read
 * @param {{ manifest: Record<string, { file?: string, sections?: string[] }[]>, excluded: RegExp[], notInMenu: Record<string, string[] | true> }} rules
 * @returns {string[]} One line per file or heading that has no menu page.
 */
export function uncovered(files, read, { manifest, excluded, notInMenu }) {
	/** @type {Set<string>} */
	const whole = new Set();
	/** @type {Map<string, Set<string>>} */
	const split = new Map();
	for (const sources of Object.values(manifest)) {
		for (const source of sources) {
			if (!source.file) continue;
			if (!source.sections) whole.add(source.file);
			else {
				const set = split.get(source.file) ?? new Set();
				for (const name of source.sections) set.add(name);
				split.set(source.file, set);
			}
		}
	}

	const problems = [];
	for (const file of files) {
		if (excluded.some((re) => re.test(file)) || whole.has(file) || notInMenu[file] === true) continue;
		const sections = split.get(file);
		if (!sections) {
			problems.push(`${file}: no menu page uses this file`);
			continue;
		}
		const doc = parse(read(file));
		const top = Math.min(...doc.sections.map((s) => s.level));
		const known = /** @type {string[]} */ (notInMenu[file] || []);
		for (const s of doc.sections.filter((x) => x.level === top)) {
			if (!sections.has(s.text) && !known.includes(s.text)) problems.push(`${file}: "${s.text}" is in no menu page`);
		}
	}
	return problems;
}

/**
 * Checks that design/docs-menu-map.md lists every page of the menu, group by
 * group, and nothing else, so the map stays the plan for the menu.
 * @param {string} map The text of docs-menu-map.md.
 * @param {{ title: string, items: { label: string, href?: string }[] }[]} nav
 * @returns {string[]}
 */
export function mapProblems(map, nav) {
	const problems = [];
	const groups = new Map();
	let current;
	for (const line of map.split('\n')) {
		const heading = line.match(/^## (.+)$/);
		if (heading) {
			current = heading[1].trim();
			groups.set(current, []);
			continue;
		}
		const row = line.match(/^\|\s*([^|]+?)\s*\|/);
		if (current && row && !/^(Menu item|-+)$/.test(row[1])) groups.get(current).push(row[1]);
	}
	for (const group of nav) {
		const listed = groups.get(group.title);
		if (!listed) {
			problems.push(`docs-menu-map.md has no "## ${group.title}" section`);
			continue;
		}
		const pages = group.items.filter((i) => i.href).map((i) => i.label);
		for (const label of pages) if (!listed.includes(label)) problems.push(`docs-menu-map.md: ${group.title} misses "${label}"`);
		for (const label of listed) if (!pages.includes(label)) problems.push(`docs-menu-map.md: ${group.title} lists "${label}", which isn't in the menu`);
	}
	return problems;
}
