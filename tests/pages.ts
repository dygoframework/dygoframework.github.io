// Pages and widths every UI test covers. The docs page is a fixed fixture,
// because synced docs change.
export const widths = [390, 768, 1024, 1440] as const;

export const pages = [
	{ name: 'home', path: '/' },
	{ name: 'styleguide', path: '/styleguide/' },
	{ name: 'docs', path: '/docs/test/fixture/' },
] as const;
