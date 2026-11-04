import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkEnv } from './env.mjs';

test('only production builds need the form endpoint', () => {
	assert.doesNotThrow(() => checkEnv({}));
	assert.throws(() => checkEnv({ DYGO_ENV: 'production' }), /PUBLIC_CONTACT_FORM_URL is required/);
	assert.throws(() => checkEnv({ DYGO_ENV: 'production', PUBLIC_CONTACT_FORM_URL: 'http://x' }), /must be an https URL/);
	assert.doesNotThrow(() => checkEnv({ DYGO_ENV: 'production', PUBLIC_CONTACT_FORM_URL: 'https://formspree.io/f/abc' }));
});
