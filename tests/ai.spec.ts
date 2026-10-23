import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("AI reflections", () => {
	test.use({ serviceWorkers: "block" });

	test("always sends Gentle words to AI, without a toggle or inline disclosure", async ({ page }) => {
		let calls = 0;
		await page.route("**/api/reflect", async (route) => {
			calls++;
			expect(route.request().postDataJSON()).toEqual({ writing: "Synthetic thought for AI", moods: ["Okay"] });
			await route.fulfill({ json: { text: "That feeling has space here." } });
		});
		await page.goto("/mirror");
		await expect(page.getByRole("checkbox", { name: "Get an AI reflection" })).toHaveCount(0);
		await expect(page.getByText("Optional. Release", { exact: false })).toHaveCount(0);
		await page.getByRole("textbox").fill("Synthetic thought for AI");
		await page.getByRole("button", { name: "Okay", exact: true }).click();
		expect(calls).toBe(0);
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { name: "That feeling has space here." })).toBeFocused();
		await expect(page.getByText("AI reflection", { exact: true })).toBeVisible();
		await page.getByRole("button", { name: "Save words", exact: true }).click();
		await expect(page.getByRole("button", { name: "Saved", exact: true })).toHaveAttribute("aria-pressed", "true");
		expect(calls).toBe(1);
		await page.getByRole("button", { name: "Write again" }).click();
		await expect(page.getByRole("textbox")).toHaveValue("");
	});

	test("failure shows an accessible floating notice, preserves writing, and retries AI", async ({ page }) => {
		let calls = 0;
		await page.route("**/api/reflect", async (route) => {
			calls++;
			if (calls === 1) await route.fulfill({ status: 503, json: { code: "provider_quota" } });
			else await route.fulfill({ json: { text: "A reflection after retry." } });
		});
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/mirror");
		await page.getByRole("textbox").fill("Synthetic draft to keep");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("textbox")).toHaveValue("Synthetic draft to keep");
		const notice = page.getByRole("status").filter({ hasText: "Responses are unavailable" });
		await expect(notice).toBeVisible();
		expect(await notice.evaluate((node) => getComputedStyle(node).position)).toBe("fixed");
		const bounds = await notice.boundingBox();
		expect(bounds!.x).toBeGreaterThan(1000);
		expect(bounds!.y).toBeGreaterThan(700);
		const scan = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
		expect(scan.violations.map(({ id }) => id)).toEqual([]);
		await page.getByRole("button", { name: "Dismiss notification" }).click();
		await expect(notice).toHaveCount(0);
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { name: "A reflection after retry." })).toBeVisible();
		expect(calls).toBe(2);
	});

	test("quiet release never sends writing", async ({ page }) => {
		let calls = 0;
		await page.route("**/api/reflect", async (route) => { calls++; await route.abort(); });
		await page.goto("/mirror");
		await page.getByRole("textbox").fill("Synthetic local release");
		await page.getByRole("button", { name: "Just let me release", exact: true }).click();
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { name: "Released.", exact: true })).toBeVisible();
		expect(calls).toBe(0);
	});

	test("the notice respects reduced motion and clears the toolbar on phones and tablets", async ({ page }) => {
		await page.route("**/api/reflect", (route) => route.fulfill({ status: 503, json: {} }));
		await page.emulateMedia({ reducedMotion: "reduce" });
		for (const width of [320, 768]) {
			await page.setViewportSize({ width, height: 740 });
			await page.goto("/mirror");
			await page.getByRole("textbox").fill("Synthetic failure");
			await page.getByRole("button", { name: "Release", exact: true }).click();
			const notice = page.locator(".slide-notice");
			await expect(notice).toBeVisible();
			expect(await notice.evaluate((node) => getComputedStyle(node).animationName)).toBe("none");
			const box = await notice.boundingBox();
			const toolbar = await page.getByRole("navigation", { name: "Canvas tools" }).boundingBox();
			expect(box!.x).toBeGreaterThanOrEqual(0);
			expect(box!.x + box!.width).toBeLessThanOrEqual(width);
			expect(box!.y + box!.height).toBeLessThan(toolbar!.y);
		}
	});
	test("failure schedules one soft sound and Settings can mute later notices", async ({ page }) => {
		await page.addInitScript(() => {
			// Headless Firefox may have no output device. Test tone scheduling independently of hardware.
			Object.defineProperty(AudioContext.prototype, "state", { get: () => "running" });
			const original = AudioContext.prototype.createOscillator;
			AudioContext.prototype.createOscillator = function () {
				const root = document.documentElement;
				root.dataset.noticeTones = String(Number(root.dataset.noticeTones ?? "0") + 1);
				return original.call(this);
			};
		});
		await page.route("**/api/reflect", async (route) => {
			await new Promise((resolve) => setTimeout(resolve, 100));
			await route.fulfill({ status: 503, json: {} });
		});
		await page.goto("/mirror");
		await page.getByRole("textbox").fill("Synthetic sound check");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.locator(".slide-notice")).toBeVisible();
		await expect(page.locator("html")).toHaveAttribute("data-notice-tones", "1");
		await page.getByRole("button", { name: "Settings", exact: true }).click();
		await page.getByRole("switch", { name: "Notification sounds" }).click();
		await expect(page.getByRole("switch", { name: "Notification sounds" })).toHaveAttribute("aria-checked", "false");
		await page.getByRole("button", { name: "Close settings" }).click();
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.locator(".slide-notice")).toBeVisible();
		await expect(page.locator("html")).toHaveAttribute("data-notice-tones", "1");
	});

});
