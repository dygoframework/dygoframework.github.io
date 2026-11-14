// Where each docs page comes from, following design/docs-menu-map.md.
// Keys are the page URLs from src/data/navigation.ts.
//
// - file: the whole file, without its title.
// - sections: named headings from a file. A page built from one section drops
//   that heading, because the page title says the same thing.
// - local: a "New" page kept in this repo under src/content/docs-pages/.

// - intro: also take the text before the first heading.
// - releases: from a changelog, the Unreleased section (marked as such) and
//   the latest release.

/** @typedef {{ file: string, sections?: string[], heading?: boolean, intro?: boolean, releases?: boolean } | { local: string }} Source */

const guide = (file, ...sections) => ({ file: `docs/${file}`, sections });

/** @type {Record<string, Source[]>} */
export const manifest = {
	// Overview
	'/docs/': [{ file: 'docs/index.md' }],
	'/docs/first-steps/': [{ file: 'docs/getting-started.md' }],
	'/docs/controllers/': [
		guide('guide-http.md', 'A controller', 'Step by step: a CRUD controller (GET, POST, PUT, PATCH, DELETE)', 'Typed input', 'Output', 'Errors'),
	],
	'/docs/providers/': [guide('guide-core.md', 'A provider and a module')],
	'/docs/modules/': [guide('guide-core.md', 'A provider and a module')],
	'/docs/middleware/': [guide('guide-production.md', 'HTTP middleware')],
	'/docs/exception-filters/': [guide('guide-pipeline.md', 'Exception filters')],
	'/docs/pipes/': [guide('guide-pipeline.md', 'Pipes and validation')],
	'/docs/guards/': [guide('guide-pipeline.md', 'Guards')],
	'/docs/interceptors/': [guide('guide-pipeline.md', 'Interceptors')],
	'/docs/route-metadata/': [guide('guide-pipeline.md', 'Metadata')],

	// Fundamentals
	'/docs/fundamentals/custom-providers/': [guide('guide-core.md', 'Values, named tokens, many dependencies')],
	'/docs/fundamentals/dynamic-modules/': [guide('guide-core.md', 'Dynamic module (forRoot)')],
	'/docs/fundamentals/injection-scopes/': [guide('guide-http.md', 'Request scope')],
	'/docs/fundamentals/circular-dependency/': [guide('guide-core.md', 'Breaking a cycle')],
	'/docs/fundamentals/module-reference/': [{ local: 'fundamentals/module-reference.md' }],
	'/docs/fundamentals/execution-context/': [guide('guide-pipeline.md', 'Execution context')],
	'/docs/fundamentals/lifecycle-events/': [guide('guide-core.md', 'Lifecycle')],
	'/docs/fundamentals/discovery/': [{ local: 'fundamentals/discovery.md' }],
	'/docs/fundamentals/standalone-apps/': [guide('guide-core.md', 'Starting the app')],
	'/docs/fundamentals/testing/': [
		guide('guide-core.md', 'Testing'),
		{ file: 'docs/recipes/testing.md' },
		{ file: 'docs/guide-testing.md', heading: true },
	],

	// Application
	'/docs/application/configuration/': [guide('guide-production.md', 'Config')],
	'/docs/application/validation/': [guide('guide-pipeline.md', 'Pipes and validation')],
	'/docs/application/logging/': [guide('guide-production.md', 'Logging')],
	'/docs/application/events/': [guide('guide-transports.md', 'Events')],
	'/docs/application/task-scheduling/': [guide('guide-transports.md', 'Schedule')],
	'/docs/application/queues/': [guide('guide-transports.md', 'Queue')],
	'/docs/application/cqrs/': [guide('guide-transports.md', 'CQRS')],
	'/docs/application/console-commands/': [guide('guide-cli.md', 'Console commands')],
	// File storage (its own module: see `modules` below)
	'/docs/application/file-storage/': [{ file: 'docs/guide-storage.md' }],

	// AI (beta, its own module: see `modules` below)
	'/docs/ai/overview-and-setup/': [{ ...guide('guide-ai.md', 'Set up'), intro: true }],
	'/docs/ai/ask-and-wait/': [guide('guide-ai.md', 'Ask and wait')],
	'/docs/ai/stream-to-the-browser/': [guide('guide-ai.md', 'Stream to the browser')],
	'/docs/ai/typed-output/': [guide('guide-ai.md', 'Typed output')],
	'/docs/ai/errors/': [guide('guide-ai.md', 'Errors')],
	'/docs/ai/retries-timeouts-and-logs/': [guide('guide-ai.md', 'Retries, timeouts and logs')],
	'/docs/ai/testing/': [guide('guide-ai.md', 'Testing')],

	// Data
	'/docs/data/sql-databases/': [guide('recipes/sql.md', 'The connection module', 'From memory to a database')],
	'/docs/data/repositories/': [guide('recipes/sql.md', 'A repository', 'Using it from a controller')],
	'/docs/data/transactions/': [guide('recipes/sql.md', 'Transactions')],
	'/docs/data/migrations/': [guide('recipes/sql.md', 'Migrations'), guide('guide-cli.md', 'Database')],
	'/docs/data/multiple-databases/': [guide('recipes/sql.md', 'Several databases', 'Per-tenant databases')],
	'/docs/data/caching/': [guide('guide-transports.md', 'Cache')],

	// Security
	'/docs/security/authentication/': [
		{ file: 'docs/recipes/auth.md' },
		guide('recipes/security.md', 'What you get', 'Tokens and sessions', 'Coming from `dygo g auth`', 'Not included'),
	],
	'/docs/security/authorization/': [guide('recipes/security.md', 'Open routes and require roles', 'Roles and authorities')],
	'/docs/security/oidc-login/': [guide('recipes/security.md', 'Login at an identity provider (`-oidc`)')],
	'/docs/security/password-hashing/': [{ local: 'security/password-hashing.md' }],
	'/docs/security/security-headers/': [{ local: 'security/security-headers.md' }],
	'/docs/security/cors/': [guide('recipes/security.md', 'Browsers (CORS)')],
	'/docs/security/csrf-protection/': [{ local: 'security/csrf-protection.md' }],
	'/docs/security/rate-limiting/': [guide('guide-production.md', 'Rate limiting')],
	'/docs/security/owasp-top-10/': [{ file: 'docs/owasp.md' }],

	// HTTP
	'/docs/http/versioning/': [{ local: 'http/versioning.md' }],
	'/docs/http/cookies/': [guide('guide-http.md', 'Typed input', 'Output')],
	'/docs/http/file-upload-and-streaming/': [guide('guide-http.md', 'Typed input', 'Output')],
	'/docs/http/compression/': [guide('guide-production.md', 'HTTP middleware')],
	'/docs/http/server-sent-events/': [{ local: 'http/server-sent-events.md' }],
	'/docs/http/health-checks/': [guide('guide-production.md', 'Health checks')],

	// APIs
	'/docs/apis/openapi/': [guide('guide-production.md', 'OpenAPI')],
	'/docs/apis/json-schema/': [{ local: 'apis/json-schema.md' }],
	'/docs/apis/graphql/': [guide('guide-transports.md', 'GraphQL')],
	'/docs/apis/websockets/': [guide('guide-transports.md', 'WebSocket gateways')],

	// Microservices
	'/docs/microservices/overview/': [guide('guide-transports.md', 'Microservices')],
	'/docs/microservices/redis/': [guide('guide-transports.md', 'Redis and Kafka')],
	'/docs/microservices/nats/': [{ local: 'microservices/nats.md' }],
	'/docs/microservices/kafka/': [guide('guide-transports.md', 'Redis and Kafka')],
	'/docs/microservices/grpc/': [guide('guide-transports.md', 'gRPC')],

	// Production
	'/docs/production/tracing-and-metrics/': [guide('guide-production.md', 'Tracing and metrics')],
	'/docs/production/docker/': [guide('guide-production.md', 'Docker')],

	// CLI
	'/docs/cli/overview/': [guide('guide-cli.md', 'New project', 'AI models')],
	'/docs/cli/generators/': [
		guide('guide-cli.md', 'Generate code', 'Entities and fields', 'CRUD for an entity', 'Console commands', 'Route tests'),
	],
	'/docs/cli/database-commands/': [guide('guide-cli.md', 'Database')],
	'/docs/cli/inspect-your-app/': [guide('guide-cli.md', "Look at a running app's shape")],
	'/docs/cli/development-server/': [guide('guide-cli.md', 'Development server', 'Route directives (dygo gen)')],

	// Project
	'/docs/project/benchmarks/': [{ file: 'benchmarks/README.md' }],
	'/docs/project/whats-new/': [{ file: 'CHANGELOG.md', releases: true }],
	'/docs/project/changelog/': [{ file: 'CHANGELOG.md' }],
	'/docs/project/security-policy/': [{ file: 'SECURITY.md' }],
};

/** Source files that are never published. Links to them go to GitHub. */
export const excluded = [/^docs\/phase-.*\.md$/, /^docs\/decisions\.md$/, /^docs\/nestjs-to-dygo\.md$/];

/** Where a link to a whole file goes when the file was split. */
export const fileHomes = {
	'docs/README.md': '/docs/',
	'docs/index.md': '/docs/',
	'docs/getting-started.md': '/docs/first-steps/',
	'docs/guide-core.md': '/docs/providers/',
	'docs/guide-http.md': '/docs/controllers/',
	'docs/guide-pipeline.md': '/docs/guards/',
	'docs/guide-production.md': '/docs/application/configuration/',
	'docs/guide-cli.md': '/docs/cli/overview/',
	'docs/guide-transports.md': '/docs/microservices/overview/',
	'docs/guide-testing.md': '/docs/fundamentals/testing/',
	'docs/guide-ai.md': '/docs/ai/overview-and-setup/',
	'docs/guide-storage.md': '/docs/application/file-storage/',
	'docs/recipes/auth.md': '/docs/security/authentication/',
	'docs/recipes/security.md': '/docs/security/authentication/',
	'docs/recipes/sql.md': '/docs/data/sql-databases/',
	'docs/recipes/testing.md': '/docs/fundamentals/testing/',
	'docs/owasp.md': '/docs/security/owasp-top-10/',
	// The MkDocs build copies these root files into docs/, so the docs link to them there.
	'docs/benchmarks.md': '/docs/project/benchmarks/',
	'docs/changelog.md': '/docs/project/changelog/',
	'docs/security.md': '/docs/project/security-policy/',
	'benchmarks/README.md': '/docs/project/benchmarks/',
	'CHANGELOG.md': '/docs/project/changelog/',
	'SECURITY.md': '/docs/project/security-policy/',
};

/**
 * Docs pages that describe a separately versioned Dygo module. The sync reads
 * the module's newest tag, such as `ai/v0.1.0-beta.1`, and puts a note at the
 * top of each page under `prefix`.
 */
export const modules = [
	{ name: 'ai', label: 'AI', prefix: '/docs/ai/' },
	{ name: 'storage', label: 'Storage', prefix: '/docs/application/file-storage/' },
];

/**
 * Dygo docs that are on purpose not in the menu: a whole file (true) or some
 * of its top-level headings. Known on 2026-11-10; review them with Dylan
 * before moving any into the menu.
 * @type {Record<string, string[] | true>}
 */
export const notInMenu = {
	// The MkDocs index of the docs folder; /docs/ uses docs/index.md.
	'docs/README.md': true,
	'docs/guide-cli.md': ['Authentication', 'Security', 'Background work and transports'],
	'docs/guide-http.md': ['App options', 'Testing'],
	'docs/guide-pipeline.md': ['Where enhancers bind'],
	'docs/recipes/security.md': ['Store users in a database', 'Generators in a security project', 'Test protected routes'],
	'docs/recipes/sql.md': ['Testing'],
};
