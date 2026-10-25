import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessible private pilot", () => {
	test.use({ serviceWorkers: "block" });
	test.beforeEach(async ({ page }) => {
		await page.route("**/api/reflect", (route) => route.fulfill({ json: { text: "A gentle AI response." } }));
	});
	test("has no automated WCAG A or AA findings in its primary views", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		for (const route of ["/", "/mirror", "/settings"]) {
			await page.goto(route);
			await page.getByRole("heading", { level: 1 }).waitFor();
			await page.evaluate(async () => {
				await document.fonts.ready;
				await new Promise<void>((done) =>
					requestAnimationFrame(() => requestAnimationFrame(() => done())),
				);
			});
			const results = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(
				results.violations.map(({ id, nodes }) => ({
					id,
					targets: nodes.map(({ target }) => target),
				})),
			).toEqual([]);
		}
		await page.goto("/mirror");
		await page.getByRole("textbox").fill("A private thought");
		await page.getByRole("button", { name: "Settings", exact: true }).click();
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
			.analyze();
		expect(results.violations.map(({ id }) => id)).toEqual([]);
	});

	test("reflows without horizontal scrolling and supports reduced motion", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		for (const width of [320, 375, 768, 1024, 1440]) {
			await page.setViewportSize({ width, height: 900 });
			for (const route of ["/", "/mirror", "/settings"]) {
				await page.goto(route);
				await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
				expect(
					await page.evaluate(
						() => document.documentElement.scrollWidth <= window.innerWidth,
					),
				).toBe(true);
			}
		}
		await page.goto("/");
		expect(
			await page.locator(".animate-blob").evaluate((orb) => {
				const radius = getComputedStyle(orb).borderTopLeftRadius;
				return radius.endsWith("%")
					? parseFloat(radius) >= 50
					: parseFloat(radius) >= orb.clientWidth / 2;
			}),
		).toBe(true);
		await page.goto("/mirror");
		await page.getByRole("textbox").fill("A moment to pause");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { level: 2 })).toBeFocused();
		await expect(page.locator(".release-petal")).toHaveCount(0);
	});
});
