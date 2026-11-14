// Menus for the top bar and the docs. The docs menu follows
// design/docs-menu-map.md. Items with `soon` have no page and no link.

export const githubUrl = 'https://github.com/dygoframework/dygo';

export interface NavLink {
	label: string;
	href: string;
	key?: 'docs' | 'start' | 'enterprise';
}

export const startUrl = '/start/';

export const mainNav: NavLink[] = [
	{ label: 'Docs', href: '/docs/', key: 'docs' },
	{ label: 'Start a project', href: startUrl, key: 'start' },
	{ label: 'Enterprise', href: '/enterprise/', key: 'enterprise' },
	{ label: 'GitHub', href: githubUrl },
];

export interface DocsItem {
	label: string;
	href?: string;
	soon?: boolean;
}

export interface DocsGroup {
	title: string;
	items: DocsItem[];
	/** A separately versioned Dygo module. Its label, such as Beta, comes from its tags. */
	module?: string;
}

const slug = (text: string) =>
	text
		.toLowerCase()
		.replace(/'/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

function group(title: string, labels: string[], soon: string[] = [], topLevel = false): DocsGroup {
	const base = topLevel ? '/docs/' : `/docs/${slug(title)}/`;
	return {
		title,
		items: [
			...labels.map((label) => ({ label, href: label === 'Introduction' ? '/docs/' : `${base}${slug(label)}/` })),
			...soon.map((label) => ({ label, soon: true })),
		],
	};
}

export const docsNav: DocsGroup[] = [
	group(
		'Overview',
		['Introduction', 'First steps', 'Controllers', 'Providers', 'Modules', 'Middleware', 'Exception filters', 'Pipes', 'Guards', 'Interceptors', 'Route metadata'],
		[],
		true,
	),
	group('Fundamentals', ['Custom providers', 'Dynamic modules', 'Injection scopes', 'Circular dependency', 'Module reference', 'Execution context', 'Lifecycle events', 'Discovery', 'Standalone apps', 'Testing']),
	group(
		'Application',
		['Configuration', 'Validation', 'Logging', 'Events', 'Task scheduling', 'Queues', 'CQRS', 'Console commands', 'File storage'],
		['Serialization', 'HTTP client', 'Internationalization', 'Mail'],
	),
	{ ...group('AI', ['Overview and setup', 'Ask and wait', 'Stream to the browser', 'Typed output', 'Errors', 'Retries, timeouts and logs', 'Testing']), module: 'ai' },
	group('Data', ['SQL databases', 'Repositories', 'Transactions', 'Migrations', 'Multiple databases', 'Caching'], ['MongoDB']),
	group(
		'Security',
		['Authentication', 'Authorization', 'OIDC login', 'Password hashing', 'Security headers', 'CORS', 'CSRF protection', 'Rate limiting', 'OWASP Top 10'],
		['Encryption'],
	),
	group(
		'HTTP',
		['Versioning', 'Cookies', 'File upload and streaming', 'Compression', 'Server-Sent Events', 'Health checks'],
		['Session', 'Model-View-Controller', 'Webhooks'],
	),
	group('APIs', ['OpenAPI', 'JSON Schema', 'GraphQL', 'WebSockets']),
	group('Microservices', ['Overview', 'Redis', 'NATS', 'Kafka', 'gRPC']),
	group('Production', ['Tracing and metrics', 'Docker']),
	group('CLI', ['Overview', 'Generators', 'Database commands', 'Inspect your app', 'Development server']),
	group('Project', ['Benchmarks', "What's new", 'Changelog', 'Security policy']),
];

/** The group that holds `path`, so only that group starts open. */
export function currentGroup(path: string): string | undefined {
	const normal = path.endsWith('/') ? path : `${path}/`;
	return docsNav.find((g) => g.items.some((i) => i.href === normal))?.title;
}

/** The license of the Dygo repo (LICENSE). */
export const license = 'MIT';

export interface FooterGroup {
	title: string;
	/** Left out below 1024px, as in the mobile design. */
	desktopOnly?: boolean;
	links: { label: string; href: string; mobileOnly?: boolean }[];
}

export const footerNav: FooterGroup[] = [
	{
		title: 'Documentation',
		links: [
			{ label: 'Quick start', href: '/docs/first-steps/' },
			{ label: 'Guides', href: '/docs/' },
			{ label: 'Benchmarks', href: '/docs/project/benchmarks/' },
		],
	},
	{
		title: 'Product',
		links: [
			{ label: 'Start a project', href: startUrl },
			{ label: 'Enterprise', href: '/enterprise/' },
			{ label: 'GitHub', href: githubUrl, mobileOnly: true },
		],
	},
	{
		title: 'Project',
		desktopOnly: true,
		links: [
			{ label: 'GitHub', href: githubUrl },
			{ label: 'Changelog', href: '/docs/project/changelog/' },
			{ label: 'Security policy', href: '/docs/project/security-policy/' },
		],
	},
];
