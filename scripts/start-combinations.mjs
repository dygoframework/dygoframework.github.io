// Runs every command the "Start a project" page can produce, for each
// combination of options, and checks that the app builds, passes its tests
// and starts. Needs Go, the dygo CLI on PATH and, for the database options,
// Docker (or DB=external with PostgreSQL and MySQL already on localhost, with
// user app, password app and a database named shop).
//
//   node scripts/start-combinations.mjs              # all combinations
//   node scripts/start-combinations.mjs login mysql  # only those matching
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { commands, groups, isComment } from '../src/data/start.ts';

const filter = process.argv.slice(2);
const external = process.env.DB === 'external';
const [security, db, ai] = groups.map((g) => g.options.map((o) => o.value));
const combos = security.flatMap((s) => db.flatMap((d) => ai.map((a) => ({ name: 'shop', security: s, db: d, ai: a }))));

const sh = (/** @type {string} */ cmd, /** @type {string} */ cwd) => spawnSync('bash', ['-c', cmd], { cwd, encoding: 'utf8' });

function resetDatabase(/** @type {string} */ kind) {
	if (kind === 'postgres') sh(`PGPASSWORD=app psql -q -h localhost -U app -d postgres -c 'DROP DATABASE IF EXISTS shop' -c 'CREATE DATABASE shop'`, '.');
	if (kind === 'mysql') sh(`mysql -h 127.0.0.1 -u app -papp -e 'DROP DATABASE IF EXISTS shop; CREATE DATABASE shop'`, '.');
}

async function starts(/** @type {string} */ cwd) {
	const child = spawn('dygo', ['start'], { cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
	let log = '';
	child.stdout.on('data', (d) => (log += d));
	child.stderr.on('data', (d) => (log += d));
	let ok = false;
	for (let i = 0; i < 90 && child.exitCode === null; i++) {
		try {
			ok = (await fetch('http://localhost:9900/health/live')).ok;
		} catch {}
		if (ok) break;
		await new Promise((r) => setTimeout(r, 1000));
	}
	try {
		process.kill(-child.pid, 'SIGTERM');
	} catch {}
	await new Promise((r) => setTimeout(r, 1000));
	return { ok, log };
}

let failed = 0;
for (const combo of combos) {
	const label = `${combo.security} ${combo.db} ${combo.ai}`;
	if (filter.some((f) => !label.split(' ').includes(f))) continue;
	const dir = mkdtempSync(join(tmpdir(), 'dygo-start-'));
	let cwd = dir;
	let problem = '';
	for (const line of commands(combo)) {
		if (line.startsWith('go install')) continue; // uses the dygo on PATH
		if (line.startsWith('cd ')) {
			cwd = join(dir, line.slice(3));
			continue;
		}
		if (isComment(line)) {
			// "# put your key in AI_API_KEY in .env": a placeholder key is enough to start.
			const env = join(cwd, '.env');
			writeFileSync(env, readFileSync(env, 'utf8').replace(/^AI_API_KEY=.*$/m, 'AI_API_KEY=placeholder'));
			continue;
		}
		if (line.startsWith('docker compose') && external) {
			resetDatabase(combo.db);
			continue;
		}
		if (line === 'dygo start') {
			for (const check of ['go build ./...', 'go vet ./...', 'go test ./...']) {
				const r = sh(check, cwd);
				if (r.status !== 0) problem ||= `${check}: ${(r.stdout + r.stderr).trim().split('\n').slice(-3).join(' ')}`;
			}
			if (problem) break;
			const r = await starts(cwd);
			if (!r.ok) problem = `dygo start: ${r.log.trim().split('\n').slice(-3).join(' ')}`;
			continue;
		}
		const r = sh(line, cwd);
		if (r.status !== 0) {
			problem = `${line}: ${(r.stdout + r.stderr).trim().split('\n').slice(-3).join(' ')}`;
			break;
		}
	}
	if (combo.db !== 'none' && !external) sh('docker compose down -v', cwd);
	console.log(`${problem ? 'FAIL' : 'ok  '} ${label}${problem ? `\n     ${problem}` : ''}`);
	if (problem) failed++;
}
if (failed) {
	console.error(`\n${failed} combination(s) failed.`);
	process.exit(1);
}
