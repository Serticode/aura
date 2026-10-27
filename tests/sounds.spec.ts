import { test, expect } from "@playwright/test";

test.use({ serviceWorkers: "block" });

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		Object.defineProperty(AudioContext.prototype, "state", { get: () => "running" });
		const original = AudioContext.prototype.createOscillator;
		AudioContext.prototype.createOscillator = function () {
			const root = document.documentElement;
			root.dataset.tones = String(Number(root.dataset.tones ?? "0") + 1);
			return original.call(this);
		};
	});
});

test("interaction sounds are opt-in, support keyboard activation, and respect mute and quiet release", async ({ page }) => {
	await page.goto("/mirror");
	await page.getByRole("button", { name: "Settings", exact: true }).click();
	const sounds = page.getByRole("switch", { name: "Interaction sounds" });
	await expect(sounds).toHaveAttribute("aria-checked", "false");
	await expect(page.locator("html")).not.toHaveAttribute("data-tones");
	await sounds.click();
	await expect(sounds).toHaveAttribute("aria-checked", "true");
	await page.getByRole("button", { name: "Close settings" }).click();
	await expect(page.getByRole("dialog", { name: "Settings", exact: true })).not.toBeVisible();
	await expect(page.locator("html")).toHaveAttribute("data-tones", "1");
	await page.getByRole("button", { name: "Okay", exact: true }).focus();
	await page.keyboard.press("Space");
	await expect(page.locator("html")).toHaveAttribute("data-tones", "2");
	await page.getByRole("button", { name: "Just let me release", exact: true }).click();
	const before = await page.locator("html").getAttribute("data-tones");
	await page.getByRole("button", { name: "Release", exact: true }).click();
	await expect(page.getByRole("heading", { name: "Released.", exact: true })).toBeVisible();
	await expect(page.locator("html")).toHaveAttribute("data-tones", before!);
	await page.getByRole("button", { name: "Settings", exact: true }).click();
	await sounds.click();
	await expect(sounds).toHaveAttribute("aria-checked", "false");
	const muted = await page.locator("html").getAttribute("data-tones");
	await page.getByRole("button", { name: "Close settings" }).click();
	await expect(page.getByRole("dialog", { name: "Settings", exact: true })).not.toBeVisible();
	await page.getByRole("link", { name: "Home", exact: true }).click();
	await expect(page.locator("html")).toHaveAttribute("data-tones", muted!);
});

test("muting sounds while a response is pending also mutes completion", async ({ page }) => {
	let respond = () => {};
	const responseReady = new Promise<void>(resolve => { respond = resolve; });
	await page.route("**/api/reflect", async route => {
		await responseReady;
		await route.fulfill({ json: { text: "Synthetic response after muting." } });
	});
	await page.goto("/mirror");
	await page.getByRole("button", { name: "Settings", exact: true }).click();
	const sounds = page.getByRole("switch", { name: "Interaction sounds", exact: true });
	await sounds.click();
	await expect(sounds).toHaveAttribute("aria-checked", "true");
	await page.getByRole("button", { name: "Close settings" }).click();
	await expect(page.getByRole("dialog", { name: "Settings", exact: true })).not.toBeVisible();
	await page.getByRole("textbox").fill("Synthetic pending response");
	await page.getByRole("button", { name: "Release", exact: true }).click();
	await expect(page.getByText("Aura is preparing your response.")).toBeVisible();
	await page.getByRole("button", { name: "Settings", exact: true }).click();
	await sounds.click();
	await expect(sounds).toHaveAttribute("aria-checked", "false");
	await page.getByRole("button", { name: "Close settings" }).click();
	await expect(page.getByRole("dialog", { name: "Settings", exact: true })).not.toBeVisible();
	const tones = await page.locator("html").getAttribute("data-tones");
	respond();
	await expect(page.getByRole("heading", { name: "Synthetic response after muting." })).toBeFocused();
	await expect(page.locator("html")).toHaveAttribute("data-tones", tones!);
});
