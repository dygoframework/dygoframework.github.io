// Home page content. Every claim comes from the Dygo repo: README.md,
// docs/owasp.md, docs/guide-ai.md and benchmarks/README.md at the synced
// commit. Code comes from tested files: tests/examples/home (the route-comment
// example, checked with `dygo gen -check` in CI) and tests/examples/ai (the AI
// guide's examples). `short` texts are the shorter mobile copy.
import mainGo from '../../tests/examples/home/main.go?raw';
import productsGo from '../../tests/examples/home/products.go?raw';
import productsGenGo from '../../tests/examples/home/dygo_gen.go?raw';
import aiGo from '../../tests/examples/ai/ai.go?raw';
import { startUrl } from './navigation';
import { moduleLabel } from './site';

// Beta, Unreleased or nothing, from the ai/v* tags.
const aiLabel = moduleLabel('ai');

/**
 * The top-level declarations of a gofmt'ed Go file whose first line (after
 * any doc comment) starts
 * with one of `starts`, in file order, so excerpts stay in sync with the
 * tested file.
 */
export function decls(src: string, ...starts: string[]): string {
	// A plain doc comment is left out; directives such as //dygo:get are kept.
	const blocks = src
		.replace(/\r\n/g, '\n')
		.trimEnd()
		.split(/\n\n+(?=\S)/)
		.map((block) => block.replace(/^(\/\/(?!dygo:|go:).*\n)+/, ''));
	const picked = blocks.filter((block) => starts.some((start) => block.startsWith(start)));
	if (picked.length !== starts.length) throw new Error(`Expected ${starts.length} declarations, found ${picked.length}: ${starts.join(', ')}`);
	return picked.join('\n\n');
}

/** A declaration's directives and first line, without its body. */
function signature(src: string, start: string): string {
	const lines = decls(src, start).split('\n');
	const head = lines.findIndex((l) => !l.startsWith('//'));
	return [...lines.slice(0, head), lines[head].replace(/ \{$/, '')].join('\n');
}

/** The one line in `src` that contains `text`, without its indent. */
function line(src: string, text: string): string {
	const found = src.split('\n').filter((l) => l.includes(text));
	if (found.length !== 1) throw new Error(`Expected one line with ${text}, found ${found.length}`);
	return found[0].trim();
}

export const aiDocs = '/docs/ai/overview-and-setup/';

export const hero = {
	pill: { label: 'New', text: aiLabel === 'Beta' ? 'AI module, now in beta' : aiLabel === 'Unreleased' ? 'AI module, unreleased' : 'AI module', href: aiDocs },
	lead: 'A modular, secure-by-default web framework for Go. Modules, dependency injection and typed handlers, on plain net/http, with a core that uses only the standard library.',
	leadShort: 'A modular, secure-by-default web framework for Go. Modules, dependency injection and typed handlers, on plain net/http.',
	actions: [
		{ label: 'Get started', href: '/docs/first-steps/', variant: 'primary' },
		{ label: 'Start a project', href: startUrl, variant: 'secondary' },
	],
} as const;

// From the README. `dygo new -security` adds login, roles and deny by default.
export const install = {
	commands: ['go install github.com/dygoframework/dygo/cmd/dygo@latest', 'dygo new shop -security', 'cd shop && dygo start'],
	note: 'A running API on localhost:9900, with login, roles, security headers, CORS, rate limits and OpenAPI docs. Requires Go 1.27+.',
};

// The json scenario of benchmarks/README.md (2026-10-31).
export const benchmarks = {
	stats: [
		{ value: '2.51 µs', label: 'Per JSON request (net/http: 2.49 µs)', short: 'Per JSON request' },
		{ value: '11', label: 'Allocations per JSON request', desktopOnly: true },
		{ value: '832 B', label: 'Memory per JSON request' },
	],
	link: { label: 'How we measure', href: '/docs/project/benchmarks/#method' },
};

// The security rules are the ones `dygo g security` writes
// (cmd/dygo/templates/security/rules.go.tmpl), as in docs/recipes/security.md.
export const familiar = {
	title: 'Familiar by design.',
	lead: 'Structure a Go backend with patterns your team already knows, in plain, readable Go.',
	items: [
		{
			title: 'Modules',
			description: "Group each feature's services and controllers in one place.",
			code: decls(productsGo, 'var ProductsModule'),
		},
		{
			title: 'Constructor injection',
			description: 'Ask for what you need. The whole graph is checked when the app starts.',
			code: decls(productsGo, 'func NewController'),
		},
		{
			title: 'Route comments',
			description: 'Put the route beside the method. <code>dygo gen</code> writes the Go for you.',
			code: `${decls(productsGo, '//dygo:controller')}\n\n${signature(productsGo, '//dygo:get')}`,
			mobileCode: true,
		},
		{
			title: 'Security rules',
			description: 'Describe who can call what in one ordered list. Everything else needs login.',
			code: 'Path("/health/**").PermitAll(),\nPath("/admin/**").HasRole("admin"),\nAnyRequest().Authenticated(),',
		},
	],
};

export const panels = [
	{
		id: 'security',
		title: 'Security',
		lead: 'Dygo is checked against the OWASP Top 10 on every change, and the safe choice is the one you get without asking.',
		short: 'Checked against the OWASP Top 10 on every change, and the safe choice is the one you get without asking.',
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
		short: 'Typed JSON handlers cost the same as hand-written net/http.',
		items: [
			'Typed JSON handlers within 1% of net/http',
			'About 2x faster than Gin and Huma on JSON',
			'The fewest allocations on JSON requests',
			'Slower than net/http and Gin on static routes',
		],
		link: { label: 'See every scenario', href: '/docs/project/benchmarks/' },
	},
];

// From docs/guide-ai.md. The code is the guide's, compiled in tests/examples/ai.
export const ai = {
	badge: aiLabel,
	title: 'Add AI to your app.',
	lead: 'Ask a model, stream answers to the browser and get typed Go structs back. Switch vendors in .env, not in code.',
	items: ['OpenAI, Anthropic and compatible servers', 'Local models with Ollama, vLLM or LM Studio', 'A fake model for tests, with no network or key'],
	link: { label: 'Read the AI guide', href: aiDocs },
	files: [
		{
			name: 'Set up',
			code: `$ dygo ai init -provider anthropic\n$ dygo ai init -provider ollama   # a local model, no key\n\n// Inject ai.Model like any other dependency\n${decls(aiGo, 'type Service', 'func NewService', 'func (s *Service) Summary')}`,
		},
		{
			name: 'Typed output',
			short: 'Typed',
			code: `${decls(aiGo, 'type Ticket')}\n\n${line(aiGo, 'ai.Generate[Ticket]')}`,
		},
		{
			name: 'Streaming',
			short: 'Stream',
			code: decls(aiGo, 'type AskIn', 'func (c *Controller) ask'),
		},
	],
};

export const features = {
	title: 'Everything in one framework.',
	items: [
		{ title: 'Modules and DI', description: 'Constructors are injected, and the whole app is checked when it starts.' },
		{ title: 'Typed handlers', description: 'Inputs are bound from tags and outputs are JSON. Bad input is a 400 before your code runs.', short: 'Bad input is a 400 before your code runs.' },
		{ title: 'Pipeline', description: 'Guards, interceptors, pipes and exception filters run around every handler.', short: 'Guards, interceptors, pipes and exception filters.' },
		{ title: 'Security', description: 'Deny by default, signed tokens, PBKDF2 passwords and rate limits on login.', short: 'Deny by default, signed tokens and rate limits on login.' },
		{ title: 'OpenAPI', description: 'An OpenAPI 3.1 document and a docs page, built from your routes.', short: 'An OpenAPI 3.1 document and docs page from your routes.' },
		{ title: 'CLI', description: 'New projects, generators, database migrations and a development server.', short: 'Projects, generators, migrations and a dev server.' },
		{ title: 'Transports', description: 'Message handlers over NATS, Redis, Kafka and gRPC, plus WebSockets and GraphQL.', short: 'NATS, Redis, Kafka, gRPC, WebSockets and GraphQL.' },
		{ title: 'AI', description: 'Ask models, stream answers and get typed results.', badge: aiLabel },
	],
};

export const code = {
	title: 'Protected from the first line.',
	lead: 'Turn on security middleware in a line each, and keep your handlers small. Write routes as comments, or as plain Go without code generation.',
	link: { label: 'Read the quick start', href: '/docs/first-steps/' },
	files: [
		{ name: 'products.go', code: decls(productsGo, '//go:generate', '//dygo:controller', 'func NewController', 'type GetIn', '//dygo:get') },
		{ name: 'Without codegen', code: `${decls(productsGenGo, 'func (c *Controller) Routes')}\n\n${decls(productsGo, 'var ProductsModule')}` },
		{ name: 'main.go', code: decls(mainGo, 'func main') },
	],
};

export const cta = {
	title: 'Start a project in a minute.',
	lead: 'Pick security, a database and an AI provider. Copy the commands and run them.',
	actions: [
		{ label: 'Start a project', href: startUrl, variant: 'primary' },
		{ label: 'Read the docs', href: '/docs/', variant: 'secondary', desktopOnly: true },
	],
} as const;
