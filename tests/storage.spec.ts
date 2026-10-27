import { test, expect } from "@playwright/test";

test.describe("Device storage recovery", () => {
	test.use({ serviceWorkers: "block" });

	test("keeps an unsaved session choice across unrelated saves and clears it on reset", async ({ page }) => {
		await page.goto("/settings");
		const sounds = page.getByRole("switch", { name: "Interaction sounds", exact: true });
		await expect(sounds).toBeEnabled();
		await page.evaluate(() => {
			const put = IDBObjectStore.prototype.put;
			IDBObjectStore.prototype.put = function (value: { readonly id: string }, key?: IDBValidKey) {
				if (this.name === "flags" && value.id === "sounds") throw new DOMException("Synthetic write failure", "QuotaExceededError");
				return put.call(this, value, key);
			};
		});
		await sounds.click();
		await expect(sounds).toHaveAttribute("aria-checked", "true");
		await expect(page.getByRole("status").filter({ hasText: "Unsaved choices" }).first()).toBeVisible();
		await page.getByRole("switch", { name: "Notification sounds", exact: true }).click();
		await expect(page.getByRole("switch", { name: "Notification sounds", exact: true })).toHaveAttribute("aria-checked", "false");
		await expect(page.getByRole("status").filter({ hasText: "Unsaved choices" }).first()).toBeVisible();
		await expect(sounds).toHaveAttribute("aria-checked", "true");
		await page.getByRole("button", { name: "Privacy & device", exact: true }).click();
		await page.getByRole("button", { name: "Clear device data", exact: true }).click();
		await page.getByRole("button", { name: "Clear data", exact: true }).click();
		await expect(page.getByText("Saved words removed. Your preferences are reset.")).toBeVisible();
		await expect(sounds).toHaveAttribute("aria-checked", "false");
	});

	test("clears saved words when legacy storage is restricted and reports partial success", async ({ page }) => {
		await page.route("**/api/reflect", route => route.fulfill({ json: { text: "Synthetic saved response." } }));
		await page.goto("/mirror");
		await page.getByRole("textbox").fill("Synthetic writing");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await page.getByRole("button", { name: "Save words", exact: true }).click();
		await expect(page.getByRole("button", { name: "Saved words (1)", exact: true })).toBeVisible();
		await page.getByRole("button", { name: "Settings", exact: true }).click();
		await page.getByRole("switch", { name: "Interaction sounds", exact: true }).click();
		await expect(page.getByRole("status").filter({ hasText: "Changes are saved" }).first()).toBeVisible();
		await page.evaluate(() => {
			Storage.prototype.removeItem = () => { throw new DOMException("Synthetic restriction", "SecurityError"); };
		});
		await page.getByRole("button", { name: "Privacy & device", exact: true }).click();
		await page.getByRole("button", { name: "Clear device data", exact: true }).click();
		await page.getByRole("button", { name: "Clear data", exact: true }).click();
		await expect(page.getByText("Saved words removed and preferences reset.", { exact: false })).toBeVisible();
		await expect(page.getByRole("switch", { name: "Interaction sounds", exact: true })).toHaveAttribute("aria-checked", "false");
		await page.getByRole("button", { name: "Close settings" }).click();
		await expect(page.getByRole("button", { name: "Saved words (0)", exact: true })).toBeVisible();
		await page.reload();
		await expect(page.getByRole("button", { name: "Saved words (0)", exact: true })).toBeVisible();
	});
});
