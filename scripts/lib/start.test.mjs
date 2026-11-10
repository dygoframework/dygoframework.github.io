import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanName, commands, notes } from '../../src/data/start.ts';

test('names start with a letter and keep only letters, numbers and dashes', () => {
	assert.equal(cleanName('My Shop!'), 'myshop');
	assert.equal(cleanName('-x'), 'x');
	assert.equal(cleanName('123shop'), 'shop');
	assert.equal(cleanName('a'.repeat(50)).length, 40);
});

test('the default choices build a secure project with PostgreSQL', () => {
	assert.deepEqual(commands({ name: 'shop', security: 'login', db: 'postgres', ai: 'none' }), [
		'go install github.com/dygoframework/dygo/cmd/dygo@latest',
		'dygo new shop -security -db postgres',
		'cd shop',
		'docker compose up -d   # start PostgreSQL',
		'dygo start',
	]);
});

test('OIDC, MySQL and a keyed AI provider', () => {
	const choices = { name: 'api', security: 'oidc', db: 'mysql', ai: 'anthropic' };
	assert.deepEqual(commands(choices), [
		'go install github.com/dygoframework/dygo/cmd/dygo@latest',
		'dygo new api -security -oidc -db mysql',
		'cd api',
		'dygo ai init -provider anthropic',
		'docker compose up -d   # start MySQL',
		'# put your key in AI_API_KEY in .env',
		'dygo start',
	]);
	assert.ok(notes(choices).some((n) => n.includes('OAUTH_ISSUER_URL')));
	assert.ok(notes(choices).includes('The AI module is in beta.'));
});

test('an empty name falls back to shop, and Ollama needs no key', () => {
	const lines = commands({ name: '', security: 'none', db: 'none', ai: 'ollama' });
	assert.equal(lines[1], 'dygo new shop');
	assert.ok(!lines.some((l) => l.includes('AI_API_KEY')));
});
