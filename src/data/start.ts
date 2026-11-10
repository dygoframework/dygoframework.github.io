// The "Start a project" page: its options and the commands they build. The
// page runs this in the browser, so nothing is sent to a server.
//
// Every combination of options was run with dygo v1.0.0-beta.2: dygo new,
// dygo ai init, go build, go vet, go test and dygo start, with
// `node scripts/start-combinations.mjs`. Fixes that came out of that:
// - With a database, `docker compose up -d` must start it before
//   `dygo start`, as `dygo new -db` itself says.
// - OpenAI and Anthropic need AI_API_KEY in .env before `dygo start`, or the
//   app refuses to start.
// - A name must start with a letter.
export type Security = 'none' | 'login' | 'oidc';
export type Database = 'none' | 'postgres' | 'mysql';
export type Provider = 'none' | 'openai' | 'anthropic' | 'ollama';

export interface Choices {
	name: string;
	security: Security;
	db: Database;
	ai: Provider;
}

export interface Option<T extends string> {
	value: T;
	label: string;
	hint: string;
}

export interface OptionGroup<K extends keyof Omit<Choices, 'name'>> {
	key: K;
	title: string;
	options: Option<Choices[K]>[];
}

export const defaults: Choices = { name: 'shop', security: 'login', db: 'postgres', ai: 'none' };

export const groups = [
	{
		key: 'security',
		title: 'Security',
		options: [
			{ value: 'none', label: 'None', hint: 'Add it later' },
			{ value: 'login', label: 'Built-in login', hint: 'Deny by default, roles, tokens' },
			{ value: 'oidc', label: 'Identity provider', hint: 'Keycloak, Auth0, Okta, Entra ID' },
		],
	},
	{
		key: 'db',
		title: 'Database',
		options: [
			{ value: 'none', label: 'None', hint: 'In memory to start' },
			{ value: 'postgres', label: 'PostgreSQL', hint: 'With migrations' },
			{ value: 'mysql', label: 'MySQL', hint: 'With migrations' },
		],
	},
	{
		key: 'ai',
		title: 'AI',
		options: [
			{ value: 'none', label: 'None', hint: 'Add it later' },
			{ value: 'openai', label: 'OpenAI', hint: 'And compatible servers' },
			{ value: 'anthropic', label: 'Anthropic', hint: 'Claude models' },
			{ value: 'ollama', label: 'Ollama', hint: 'A local model, no key' },
		],
	},
] as const satisfies readonly [OptionGroup<'security'>, OptionGroup<'db'>, OptionGroup<'ai'>];

export const nameHint = 'Lowercase letters, numbers and dashes, starting with a letter.';

/** What `dygo new` accepts: a letter, then letters, numbers and dashes. At most 40 characters. */
export function cleanName(input: string): string {
	return input
		.toLowerCase()
		.replace(/[^a-z0-9-]/g, '')
		.replace(/^[^a-z]+/, '')
		.slice(0, 40);
}

/** A comment line: shown without a prompt, and harmless when pasted. */
export const isComment = (line: string) => line.startsWith('#');

export function needsKey(ai: Provider): boolean {
	return ai === 'openai' || ai === 'anthropic';
}

export function commands(choices: Choices): string[] {
	const name = cleanName(choices.name) || defaults.name;
	let create = `dygo new ${name}`;
	if (choices.security !== 'none') create += ' -security';
	if (choices.security === 'oidc') create += ' -oidc';
	if (choices.db !== 'none') create += ` -db ${choices.db}`;
	const lines = ['go install github.com/dygoframework/dygo/cmd/dygo@latest', create, `cd ${name}`];
	if (choices.ai !== 'none') lines.push(`dygo ai init -provider ${choices.ai}`);
	if (choices.db !== 'none') lines.push(`docker compose up -d   # start ${choices.db === 'postgres' ? 'PostgreSQL' : 'MySQL'}`);
	if (needsKey(choices.ai)) lines.push('# put your key in AI_API_KEY in .env');
	lines.push('dygo start');
	return lines;
}

/** The AI group's legend, with the module's label from its tags, such as "AI (beta)". */
export function aiTitle(label?: string): string {
	return label ? `AI (${label.toLowerCase()})` : 'AI';
}

/** `aiLabel` is the AI module's label from its tags: Beta, Unreleased or none. */
export function notes(choices: Choices, aiLabel: string | undefined = 'Beta'): string[] {
	const out = ['Your API runs on localhost:9900, with OpenAPI docs at /docs. Requires Go 1.27+.'];
	if (choices.db !== 'none') out.push('The database runs in Docker, from compose.yaml.');
	if (choices.security === 'oidc') out.push('Set OAUTH_ISSUER_URL and OAUTH_AUDIENCE in .env to your identity provider.');
	if (needsKey(choices.ai)) out.push('Put your API key in .env. It is git-ignored.');
	if (choices.ai !== 'none' && aiLabel === 'Beta') out.push('The AI module is in beta.');
	if (choices.ai !== 'none' && aiLabel === 'Unreleased') out.push("The AI module isn't released yet.");
	return out;
}
