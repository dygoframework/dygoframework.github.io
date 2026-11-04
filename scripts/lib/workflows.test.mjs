// Every action in the workflows is pinned to a full commit SHA (PLAN.md phase 6).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const dir = new URL('../../.github/workflows/', import.meta.url);

for (const name of readdirSync(dir).filter((f) => f.endsWith('.yml'))) {
	test(`${name} pins every action to a commit`, () => {
		const uses = [...readFileSync(new URL(name, dir), 'utf8').matchAll(/uses:\s*([^\s#]+)/g)].map((m) => m[1]);
		for (const action of uses.filter((u) => !u.startsWith('./'))) {
			assert.match(action, /^[\w.-]+\/[\w./-]+@[0-9a-f]{40}$/, `${name}: ${action}`);
		}
	});
}

test('the deploy builds for production with the form endpoint and publishes dist', () => {
	const deploy = readFileSync(new URL('deploy.yml', dir), 'utf8');
	assert.match(deploy, /DYGO_ENV: production/);
	assert.match(deploy, /PUBLIC_CONTACT_FORM_URL: \$\{\{ vars\.PUBLIC_CONTACT_FORM_URL \}\}/);
	assert.match(deploy, /path: dist/);
	assert.match(readFileSync(new URL('../../public/CNAME', import.meta.url), 'utf8'), /^dygoframework\.com\n$/);
});

test('docs changes, a nightly run and manual runs trigger the docs sync', () => {
	const sync = readFileSync(new URL('sync-docs.yml', dir), 'utf8');
	for (const trigger of ['repository_dispatch:', 'schedule:', 'workflow_dispatch:', 'uses: ./.github/workflows/deploy.yml']) {
		assert.ok(sync.includes(trigger), trigger);
	}
});
