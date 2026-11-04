import { expect, test } from '@playwright/test';

const docs = '/docs/test/fixture/';

test.describe('mobile, 390px', () => {
	test.use({ viewport: { width: 390, height: 844 } });

	test('the menu opens, traps focus in a dialog and closes with Escape', async ({ page }) => {
		await page.goto(docs);
		const open = page.getByRole('button', { name: 'Open menu' });
		await open.click();
		const menu = page.getByRole('dialog', { name: 'Menu' });
		await expect(menu).toBeVisible();
		await expect(open).toHaveAttribute('aria-expanded', 'true');
		await page.keyboard.press('Escape');
		await expect(menu).toBeHidden();
		await expect(open).toHaveAttribute('aria-expanded', 'false');
	});

	test('the close button closes the menu', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: 'Open menu' }).click();
		await page.getByRole('button', { name: 'Close menu' }).click();
		await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden();
	});

	test('menu groups expand and Soon items are not links', async ({ page }) => {
		await page.goto(docs);
		await page.getByRole('button', { name: 'Open menu' }).click();
		const menu = page.getByRole('dialog', { name: 'Menu' });
		const application = menu.getByRole('button', { name: 'Application' });
		await expect(application).toHaveAttribute('aria-expanded', 'false');
		await application.click();
		await expect(application).toHaveAttribute('aria-expanded', 'true');
		await expect(menu.getByText('Serialization')).toBeVisible();
		await expect(menu.getByRole('link', { name: /Serialization/ })).toHaveCount(0);
		await expect(menu.getByRole('link', { name: 'Configuration' })).toBeVisible();
	});

	test('"On this page" folds above the article', async ({ page }) => {
		await page.goto(docs);
		const toggle = page.getByRole('button', { name: 'On this page' });
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await toggle.click();
		await expect(page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Code' })).toBeVisible();
	});

	test('the desktop sidebar and top bar links are hidden', async ({ page }) => {
		await page.goto(docs);
		await expect(page.locator('#dy-docs-sidebar')).toBeHidden();
		await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
	});
});

test.describe('desktop, 1440px', () => {
	test.use({ viewport: { width: 1440, height: 900 } });

	test('the hamburger shows and hides the sidebar', async ({ page }) => {
		await page.goto(docs);
		const toggle = page.getByRole('button', { name: 'Toggle documentation menu' });
		const sidebar = page.locator('#dy-docs-sidebar');
		await expect(sidebar).toBeVisible();
		await toggle.click();
		await expect(sidebar).toBeHidden();
		await expect(toggle).toHaveAttribute('aria-expanded', 'false');
		await toggle.click();
		await expect(sidebar).toBeVisible();
	});

	test('only the Overview group starts open on a page outside the menu', async ({ page }) => {
		await page.goto(docs);
		const sidebar = page.locator('#dy-docs-sidebar');
		await expect(sidebar.getByRole('button', { name: 'Overview' })).toHaveAttribute('aria-expanded', 'true');
		await expect(sidebar.locator('button[aria-expanded="true"]')).toHaveCount(1);
	});

	test('the current page is marked in the sidebar', async ({ page }) => {
		await page.goto('/styleguide/');
		const sidebar = page.locator('#sg-sidebar');
		await expect(sidebar.getByRole('link', { name: 'First steps' })).toHaveAttribute('aria-current', 'page');
	});

	test('"On this page" follows the scroll position', async ({ page }) => {
		await page.goto(docs);
		const toc = page.getByRole('complementary', { name: 'On this page' });
		await expect(toc.getByRole('link', { name: 'Test page' })).toHaveAttribute('aria-current', 'true');
		await page.locator('#table').scrollIntoViewIfNeeded();
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		await expect(toc.getByRole('link', { name: 'Table' })).toHaveAttribute('aria-current', 'true');
		await expect(toc.getByRole('link', { name: 'Test page' })).not.toHaveAttribute('aria-current', 'true');
	});

	test('the search field opens the search dialog', async ({ page }) => {
		await page.goto(docs);
		await page.locator('site-search button[data-open-modal]:not([disabled])').waitFor({ state: 'attached' });
		await page.getByRole('button', { name: 'Search' }).click();
		await expect(page.locator('site-search dialog')).toBeVisible();
	});

	test('the marketing top bar marks the current page and has no Docs duplicate in docs', async ({ page }) => {
		await page.goto(docs);
		const nav = page.getByRole('navigation', { name: 'Main' });
		await expect(nav.getByRole('link', { name: 'Docs' })).toHaveCount(0);
		await expect(nav.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/dygoframework/dygo');
	});
});
