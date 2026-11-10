// The Dygo version shown in the docs top bar. The docs sync writes it from the
// latest Git tag. When there is no tag, the top bar hides the version.
// Screenshot tests set DYGO_TEST_VERSION so a new release doesn't change them.
const generated = import.meta.glob<{ version: string | null; modules?: Record<string, string | null> }>('../generated/docs.json', {
	eager: true,
	import: 'default',
});
const docs = Object.values(generated)[0];

export const version: string | undefined = process.env.DYGO_TEST_VERSION || (docs?.version ?? undefined);

export type ModuleLabel = 'Beta' | 'Unreleased';

/**
 * The label for a separately versioned Dygo module, such as `ai`, from its
 * newest tag (ai/v0.1.0-beta.1 is Beta). No tag is Unreleased, and a stable
 * release has no label. The docs sync writes the tags.
 */
export function moduleLabel(name: string): ModuleLabel | undefined {
	const tag = docs?.modules?.[name];
	if (!docs || tag === undefined) return 'Beta'; // not synced yet: assume the least stable label
	return moduleLabelFor(tag);
}

export function moduleLabelFor(tag: string | null): ModuleLabel | undefined {
	if (!tag) return 'Unreleased';
	return /-(alpha|beta|rc)/.test(tag) ? 'Beta' : undefined;
}

export const siteName = 'Dygo';
export const shareImage = { path: '/og.png', width: 1280, height: 640, alt: 'Dygo: secure by default, fast by design.' };
