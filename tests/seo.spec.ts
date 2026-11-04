import { expect, test } from '@playwright/test';

const pages = [
	{ path: '/', title: 'Dygo: a secure, fast Go framework' },
	{ path: '/enterprise/', title: 'Dygo Enterprise' },
	{ path: '/docs/guards/', title: 'Guards | Dygo' },
];

for (const { path, title } of pages) {
	test(`${path} has a title, description, canonical URL and share tags`, async ({ page }) => {
		await page.goto(path);
		await expect(page).toHaveTitle(title);
		const meta = (selector: string) => page.locator(selector).first().getAttribute('content');
		expect((await meta('meta[name="description"]'))?.length).toBeGreaterThan(40);
		expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe(`https://www.dygoframework.com${path}`);
		expect(await meta('meta[property="og:title"]')).toBeTruthy();
		expect(await meta('meta[property="og:description"]')).toBeTruthy();
		expect(await meta('meta[property="og:url"]')).toBe(`https://www.dygoframework.com${path}`);
		expect(await meta('meta[property="og:image"]')).toBe('https://www.dygoframework.com/og.png');
		expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
		await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
	});
}

test('the share image, robots file and sitemap are served', async ({ request }) => {
	const image = await request.get('/og.png');
	expect(image.status()).toBe(200);
	expect(image.headers()['content-type']).toBe('image/png');
	expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://www.dygoframework.com/sitemap-index.xml');
	const sitemap = await (await request.get('/sitemap-0.xml')).text();
	expect(sitemap).toContain('<loc>https://www.dygoframework.com/</loc>');
	expect(sitemap).toContain('<loc>https://www.dygoframework.com/enterprise/</loc>');
	expect(sitemap).toContain('<loc>https://www.dygoframework.com/docs/guards/</loc>');
	expect(sitemap).not.toContain('styleguide');
	expect(sitemap).not.toContain('/docs/test/');
	expect(sitemap).not.toContain('404');
});

test('an unknown URL gets the 404 page, which is not indexed', async ({ page }) => {
	const response = await page.goto('/no-such-page/');
	expect(response?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Page not found.');
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
	await expect(page.getByRole('main').getByRole('link', { name: /Quick start/ })).toHaveAttribute('href', '/docs/first-steps/');
});
