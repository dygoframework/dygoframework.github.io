import { defineConfig } from '@playwright/test';

// Screenshots are compared in the Linux container that CI uses, so baselines
// have no platform suffix. Run `npm run test:visual` to use that container.
export default defineConfig({
	testDir: './tests',
	snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: 'http://127.0.0.1:4321',
		colorScheme: 'dark',
	},
	expect: {
		toHaveScreenshot: { threshold: 0.02, maxDiffPixels: 0, animations: 'disabled', caret: 'hide' },
	},
	projects: [
		{ name: 'visual', testMatch: /visual\.spec\.ts/ },
		{ name: 'a11y', testMatch: /a11y\.spec\.ts/ },
	],
	webServer: {
		command: 'node scripts/serve-dist.mjs',
		url: 'http://127.0.0.1:4321/',
		reuseExistingServer: false,
	},
});
