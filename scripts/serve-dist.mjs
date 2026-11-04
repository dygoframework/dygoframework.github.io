// Serves dist/ for tests, the way GitHub Pages does: folder URLs load
// index.html and unknown paths get 404.html.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('../dist/', import.meta.url).pathname;
const port = Number(process.env.PORT ?? 4321);
const types = {
	'.html': 'text/html; charset=utf-8',
	'.css': 'text/css',
	'.js': 'text/javascript',
	'.mjs': 'text/javascript',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.woff2': 'font/woff2',
	'.woff': 'font/woff',
	'.xml': 'application/xml',
	'.txt': 'text/plain',
	'.wasm': 'application/wasm',
};

async function resolve(urlPath) {
	const path = join(root, normalize(decodeURIComponent(urlPath)).replace(/^(\.\.[/\\])+/, ''));
	if (!path.startsWith(root)) return null;
	try {
		const info = await stat(path);
		return info.isDirectory() ? join(path, 'index.html') : path;
	} catch {
		return null;
	}
}

createServer(async (req, res) => {
	const path = await resolve(new URL(req.url ?? '/', 'http://localhost').pathname);
	try {
		if (!path) throw new Error('not found');
		const body = await readFile(path);
		res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
		res.end(body);
	} catch {
		res.writeHead(404, { 'content-type': types['.html'] });
		res.end(await readFile(join(root, '404.html')).catch(() => 'Not found'));
	}
}).listen(port, '127.0.0.1', () => console.log(`Serving dist on http://127.0.0.1:${port}`));
