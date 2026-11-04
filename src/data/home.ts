// Home page content. Every claim comes from the Dygo repo: README.md,
// docs/owasp.md and benchmarks/README.md at the synced commit. The code tabs
// are the tested example in tests/examples/home.
import mainGo from '../../tests/examples/home/main.go?raw';
import productsGo from '../../tests/examples/home/products.go?raw';
import productsTestGo from '../../tests/examples/home/products_test.go?raw';
import { githubUrl } from './navigation';

export const hero = {
	eyebrow: 'The Dygo Framework for Go',
	lead: 'A modular, secure-by-default web framework for Go. Modules, dependency injection and typed handlers, on plain net/http, with a core that uses only the standard library.',
	actions: [
		{ label: 'Get started', href: '/docs/first-steps/', variant: 'primary' },
		{ label: 'GitHub', href: githubUrl, variant: 'secondary' },
	],
} as const;

// From the README. `dygo new -security` adds login, roles and deny by default.
export const install = {
	commands: ['go install github.com/dygoframework/dygo/cmd/dygo@latest', 'dygo new shop -security', 'cd shop && dygo start'],
	note: 'A running API on localhost:9900, with login, roles, security headers, CORS, rate limits and OpenAPI docs. Requires Go 1.27+.',
};

export const panels = [
	{
		id: 'security',
		title: 'Security',
		lead: 'Dygo is checked against the OWASP Top 10 on every change, and the safe choice is the one you get without asking.',
		items: [
			'Deny by default with dygo new -security',
			'Secure headers and CORS in new projects',
			'Strict JSON and body size limits',
			'OWASP Top 10 checks in CI',
		],
		link: { label: 'What stays with your app', href: '/docs/security/owasp-top-10/#what-stays-with-the-app' },
	},
	{
		id: 'performance',
		title: 'Performance',
		lead: 'Typed JSON handlers cost the same as hand-written net/http. A fixed cost of about 0.5 µs per request shows on routes with almost no work.',
		items: [
			'Typed JSON handlers within 1% of net/http',
			'About 2x faster than Gin and Huma on JSON',
			'The fewest allocations on JSON requests',
			'Slower than net/http and Gin on static routes',
		],
		link: { label: 'See every scenario', href: '/docs/project/benchmarks/' },
	},
];

// The json scenario of benchmarks/README.md (2026-10-31).
export const benchmarks = {
	stats: [
		{ value: '2.51 µs', label: 'Per JSON request (net/http: 2.49 µs)' },
		{ value: '11', label: 'Allocations per JSON request' },
		{ value: '832 B', label: 'Memory per JSON request' },
	],
	note: 'In-process framework cost, with no network, for POST /users/42 with JSON in and out. Measured 2026-10-31.',
	link: { label: 'How we measure', href: '/docs/project/benchmarks/#method' },
};

export const features = {
	title: 'Security and speed in every layer.',
	items: [
		{ title: 'Modules and DI', description: 'Constructors are injected, and the whole app is checked when it starts.' },
		{ title: 'Typed handlers', description: 'Inputs are bound from tags and outputs are JSON. Bad input is a 400 before your code runs.' },
		{ title: 'Pipeline', description: 'Guards, interceptors, pipes and exception filters run around every handler.' },
		{ title: 'Security', description: 'Deny by default, signed tokens, PBKDF2 passwords and rate limits on login.' },
		{ title: 'CLI', description: 'New projects, generators, database migrations and a development server.' },
		{ title: 'Transports', description: 'Message handlers over NATS, Redis, Kafka and gRPC, plus WebSockets and GraphQL.' },
	],
};

export const code = {
	title: 'Protected from the first line.',
	lead: 'Turn on security middleware in a line each, and keep your handlers small.',
	link: { label: 'Read the quick start', href: '/docs/first-steps/' },
	files: [
		{ name: 'main.go', code: mainGo },
		{ name: 'products.go', code: productsGo },
		{ name: 'products_test.go', code: productsTestGo },
	],
};

export const docsLinks = {
	title: 'Start with the docs.',
	action: { label: 'Get started', href: '/docs/first-steps/' },
	cards: [
		{ title: 'Quick start', description: 'Build your first service.', href: '/docs/first-steps/' },
		{ title: 'Security', description: 'Protect your routes.', href: '/docs/security/authentication/' },
		{ title: 'Performance', description: 'See the benchmarks.', href: '/docs/project/benchmarks/' },
		{ title: 'CLI', description: 'Generate code and run your app.', href: '/docs/cli/overview/' },
	],
};
