// Builds the test site and runs a Playwright project. Screenshots only match
// the Linux image CI uses, so on other systems this reruns itself in Docker.
// Usage: node scripts/playwright.mjs <visual|a11y> [--update-snapshots]
import { spawnSync } from 'node:child_process';
import { platform } from 'node:os';

const [project, ...args] = process.argv.slice(2);
const image = 'mcr.microsoft.com/playwright:v1.63.0-noble';

function run(command, commandArgs) {
	const result = spawnSync(command, commandArgs, { stdio: 'inherit', env: { ...process.env, INCLUDE_DEV_PAGES: 'true', DYGO_TEST_VERSION: 'v0.0.0-test', PUBLIC_CONTACT_FORM_URL: 'https://forms.test/contact' } });
	if (result.status !== 0) process.exit(result.status ?? 1);
}

if (project === 'visual' && platform() !== 'linux' && !process.env.CI) {
	// node_modules lives in a volume so the container's Linux packages never
	// replace the host's. Limits keep the shared Docker VM healthy.
	run('docker', [
		'run', '--rm', '--cpus=2', '--memory=3g', '--ipc=host',
		'-v', `${process.cwd()}:/work`,
		'-v', 'dygo-website-node-modules:/work/node_modules',
		'-w', '/work', image,
		'/bin/bash', '-c', `npm ci --no-audit --no-fund && node scripts/playwright.mjs visual ${args.join(' ')}`,
	]);
} else {
	run('npm', ['run', 'build']);
	run('npx', ['playwright', 'test', `--project=${project}`, ...args]);
}
