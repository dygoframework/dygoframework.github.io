import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { pages, widths } from './pages';

for (const { name, path } of pages) {
	for (const width of widths) {
		test(`${name} at ${width}px has no axe violations`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(path);
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
				// Starlight's stock search button. The Dygo top bar replaces it in Phase 2.
				.exclude('button[data-open-modal]')
				.analyze();
			expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(', ')}`)).toEqual([]);
		});
	}
}

test('the check catches an input with no label', async ({ page }) => {
	await page.goto('/styleguide/');
	await page.evaluate(() => {
		const input = document.createElement('input');
		input.type = 'email';
		document.querySelector('main')?.append(input);
	});
	const results = await new AxeBuilder({ page }).analyze();
	expect(results.violations.map((v) => v.id)).toContain('label');
});

test('Tab reaches the styleguide buttons and inputs with a visible focus ring', async ({ page }) => {
	await page.goto('/styleguide/');
	const first = page.locator('.dy-button:not([disabled])').first();
	await first.focus();
	await expect(first).toBeFocused();
	const outline = await first.evaluate((el) => getComputedStyle(el).outlineStyle);
	expect(outline).toBe('solid');
	await page.keyboard.press('Tab');
	await expect(page.locator(':focus')).toHaveCount(1);
});
