// The Dygo version shown in the docs top bar. The docs sync writes it from the
// latest Git tag. When there is no tag, the top bar hides the version.
// Screenshot tests set DYGO_TEST_VERSION so a new release doesn't change them.
const generated = import.meta.glob<{ version: string | null }>('../generated/docs.json', { eager: true, import: 'default' });

export const version: string | undefined =
	process.env.DYGO_TEST_VERSION || (Object.values(generated)[0]?.version ?? undefined);

export const siteName = 'Dygo';
export const shareImage = { path: '/og.png', width: 1280, height: 640, alt: 'Dygo: secure by default, fast by design.' };
