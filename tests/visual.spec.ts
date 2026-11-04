import { expect, test } from '@playwright/test';
import { pages, widths } from './pages';

for (const { name, path } of pages) {
	for (const width of widths) {
		test(`${name} at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(path);
			await page.evaluate(() => document.fonts.ready);
			await expect(page).toHaveScreenshot(`${name}-${width}.png`, { fullPage: true });
		});
	}
}
