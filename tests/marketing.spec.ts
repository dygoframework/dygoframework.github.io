import { expect, test } from '@playwright/test';

const endpoint = 'https://forms.test/contact';

test.describe('Enterprise contact form', () => {
	test('shows success only after the request succeeds, with a loading state', async ({ page }) => {
		let release = () => {};
		const sent: string[] = [];
		await page.route(endpoint, async (route) => {
			sent.push(route.request().postData() ?? '');
			await new Promise<void>((resolve) => (release = resolve));
			await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
		});
		await page.goto('/enterprise/');
		await page.getByLabel('Work email').fill('ada@example.com');
		await page.getByRole('button', { name: 'Get in touch' }).click();

		const sending = page.getByRole('button', { name: 'Sending' });
		await expect(sending).toBeDisabled();
		await expect(sending).toHaveAttribute('aria-busy', 'true');
		await expect(page.getByText("Thanks. We'll reply by email.")).toBeHidden();

		release();
		await expect(page.getByRole('status')).toHaveText("Thanks. We'll reply by email.");
		expect(JSON.parse(sent[0])).toEqual({ email: 'ada@example.com' });
	});

	test('shows an error, never success, when the request fails', async ({ page }) => {
		await page.route(endpoint, (route) => route.fulfill({ status: 500, body: 'no' }));
		await page.goto('/enterprise/');
		await page.getByLabel('Work email').fill('ada@example.com');
		await page.getByRole('button', { name: 'Get in touch' }).click();
		await expect(page.getByRole('alert')).toContainText("didn't send");
		await expect(page.getByText("Thanks. We'll reply by email.")).toBeHidden();
		await expect(page.getByRole('button', { name: 'Get in touch' })).toBeEnabled();
	});

	test('shows an error when the network fails', async ({ page }) => {
		await page.route(endpoint, (route) => route.abort());
		await page.goto('/enterprise/');
		await page.getByLabel('Work email').fill('ada@example.com');
		await page.getByRole('button', { name: 'Get in touch' }).click();
		await expect(page.getByRole('alert')).toContainText("didn't send");
	});

	test('checks the email before sending', async ({ page }) => {
		let calls = 0;
		await page.route(endpoint, (route) => {
			calls++;
			return route.fulfill({ status: 200 });
		});
		await page.goto('/enterprise/');
		await page.getByLabel('Work email').fill('not an email');
		await page.getByRole('button', { name: 'Get in touch' }).click();
		await expect(page.getByRole('alert')).toHaveText('Enter a valid work email address.');
		await expect(page.getByLabel('Work email')).toHaveAttribute('aria-invalid', 'true');
		expect(calls).toBe(0);
	});

	test('does not send when the spam trap is filled', async ({ page }) => {
		let calls = 0;
		await page.route(endpoint, (route) => {
			calls++;
			return route.fulfill({ status: 200 });
		});
		await page.goto('/enterprise/');
		await page.getByLabel('Work email').fill('ada@example.com');
		await page.locator('input[name="_gotcha"]').fill('bot', { force: true });
		await page.getByRole('button', { name: 'Get in touch' }).click();
		await expect(page.getByRole('alert')).toBeVisible();
		expect(calls).toBe(0);
	});
});

test.describe('Home', () => {
	test('code tabs switch files', async ({ page }) => {
		await page.goto('/');
		const tabs = page.getByRole('group', { name: 'Code files' });
		await expect(tabs.getByRole('button', { name: 'products.go' })).toHaveAttribute('aria-pressed', 'true');
		await tabs.getByRole('button', { name: 'Without codegen' }).click();
		await expect(tabs.getByRole('button', { name: 'Without codegen' })).toHaveAttribute('aria-pressed', 'true');
		await expect(page.getByText('func (c *Controller) Routes(r dygo.Router) {')).toBeVisible();
		await expect(page.getByText('//go:generate dygo gen')).toBeHidden();
	});

	test('AI tabs switch examples', async ({ page }) => {
		await page.goto('/');
		const tabs = page.getByRole('group', { name: 'AI examples' });
		await tabs.getByRole('button', { name: 'Typed output' }).click();
		await expect(tabs.getByRole('button', { name: 'Typed output' })).toHaveAttribute('aria-pressed', 'true');
		await expect(page.locator('#ai').getByText('ai.Generate[Ticket]')).toBeVisible();
	});

	test('the install box copies the commands', async ({ page, context }) => {
		await context.grantPermissions(['clipboard-read', 'clipboard-write']);
		await page.goto('/');
		await page.getByRole('button', { name: 'Copy', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
			'go install github.com/dygoframework/dygo/cmd/dygo@latest\ndygo new shop -security\ncd shop && dygo start',
		);
	});

	test('uses none of the API names the plan rules out', async ({ page }) => {
		await page.goto('/');
		const html = await page.content();
		for (const banned of ['dygo.New()', 'app.GET', 'app.Use', 'dygo.RateLimit(100)', 'c.JSON', 'dygo.Map', '[YOUR-ORG]', 'Built-in profiling', 'Graceful handling under load']) {
			expect(html, banned).not.toContain(banned);
		}
	});
});

test.describe('Start a project', () => {
	test('builds the commands from the options, in the browser', async ({ page }) => {
		const requests: string[] = [];
		await page.goto('/start/');
		page.on('request', (r) => requests.push(r.url()));
		const output = page.getByLabel('Generated commands');
		await expect(output).toContainText('dygo new shop -security -db postgres');
		await page.getByLabel('Project name').fill('9 My Api');
		await page.getByText('Identity provider').click();
		await page.getByText('MySQL').click();
		await page.getByText('Anthropic').click();
		await expect(page.getByLabel('Project name')).toHaveValue('myapi');
		await expect(output).toContainText('dygo new myapi -security -oidc -db mysql');
		await expect(output).toContainText('dygo ai init -provider anthropic');
		await expect(output).toContainText('docker compose up -d');
		await expect(output).toContainText('# put your key in AI_API_KEY in .env');
		expect(requests).toEqual([]);
	});

	test('the options are radio buttons', async ({ page }) => {
		await page.goto('/start/');
		const security = page.getByRole('group', { name: 'Security' });
		await expect(security.getByRole('radio', { name: /Built-in login/ })).toBeChecked();
		await security.getByRole('radio', { name: /Built-in login/ }).focus();
		await page.keyboard.press('ArrowRight');
		await expect(security.getByRole('radio', { name: /Identity provider/ })).toBeChecked();
	});
});
