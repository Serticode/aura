import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("opens from the footer, preserves writing, remembers read status and restores focus", async ({
	page,
	context,
}) => {
	await page.goto("/mirror");
	await page.getByRole("textbox").fill("SYNTHETIC_UPDATE_DRAFT");
	const trigger = page.getByRole("button", { name: /What’s new/ });
	await expect(page.getByTestId("updates-unread")).toBeVisible();
	const second = await context.newPage();
	await second.goto("/");
	await expect(second.getByTestId("updates-unread")).toBeVisible();
	await trigger.click();
	const panel = page.getByRole("dialog", { name: "What’s new", exact: true });
	await expect(panel).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Close updates" }),
	).toBeFocused();
	await page.keyboard.press("Tab");
	await expect(
		panel.getByRole("region", { name: "Release notes" }),
	).toBeFocused();
	await expect(
		panel.getByRole("heading", { name: "Words worth keeping" }),
	).toBeVisible();
	await expect(page.getByTestId("updates-unread")).toHaveCount(0);
	await expect(second.getByTestId("updates-unread")).toHaveCount(0);
	await page.keyboard.press("Escape");
	await expect(panel).not.toBeVisible();
	await expect(trigger).toBeFocused();
	await expect(page.getByRole("textbox")).toHaveValue("SYNTHETIC_UPDATE_DRAFT");
	await trigger.click();
	await panel.getByRole("button", { name: "Got it", exact: true }).click();
	await expect(panel).not.toBeVisible();
	await expect(trigger).toBeFocused();
	await page.reload();
	await expect(trigger).toBeEnabled();
	await expect(trigger).toHaveAccessibleName("What’s new");
	await page.getByRole("button", { name: "Settings", exact: true }).click();
	await page
		.getByRole("button", { name: "Privacy & device", exact: true })
		.click();
	await page
		.getByRole("button", { name: "Clear device data", exact: true })
		.click();
	await page.getByRole("button", { name: "Clear data", exact: true }).click();
	await page.getByRole("button", { name: "Close settings" }).click();
	await expect(page.getByTestId("updates-unread")).toBeVisible();
});

test("read failures leave notes usable without repeatedly showing the dot during the session", async ({
	page,
}) => {
	await page.addInitScript(() => {
		IDBFactory.prototype.open = () => {
			throw new DOMException("Synthetic storage restriction", "SecurityError");
		};
	});
	await page.goto("/");
	const trigger = page.getByRole("button", { name: /What’s new/ });
	await expect(page.getByTestId("updates-unread")).toBeVisible();
	await trigger.click();
	await expect(
		page
			.getByRole("dialog", { name: "What’s new", exact: true })
			.getByRole("status"),
	).toContainText("Your read status can’t be saved");
	await page.getByRole("button", { name: "Got it", exact: true }).click();
	await expect(trigger).toBeFocused();
	await expect(page.getByTestId("updates-unread")).toHaveCount(0);
	await trigger.click();
	await expect(
		page.getByRole("dialog", { name: "What’s new", exact: true }),
	).toBeVisible();
});

test("older release IDs become unread, and restricted storage still allows dismissal and reopening", async ({
	page,
}) => {
	await page.goto("/");
	await expect(page.getByRole("button", { name: /What’s new/ })).toBeEnabled();
	await page.evaluate(async () => {
		const request = indexedDB.open("aura");
		const db = await new Promise<IDBDatabase>((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction("updates", "readwrite");
			transaction
				.objectStore("updates")
				.put({ id: "lastSeen", releaseId: "previous-release" });
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
		});
		db.close();
	});
	await page.reload();
	await expect(page.getByTestId("updates-unread")).toBeVisible();
	await page.evaluate(() => {
		const put = IDBObjectStore.prototype.put;
		IDBObjectStore.prototype.put = function (value, key) {
			if (this.name === "updates")
				throw new DOMException("Synthetic write failure", "QuotaExceededError");
			return put.call(this, value, key);
		};
	});
	await page.getByRole("button", { name: /What’s new/ }).click();
	await expect(
		page
			.getByRole("dialog", { name: "What’s new", exact: true })
			.getByRole("status"),
	).toContainText("Your read status can’t be saved");
	await page.getByRole("button", { name: "Close updates" }).click();
	await expect(
		page.getByRole("dialog", { name: "What’s new", exact: true }),
	).not.toBeVisible();
	await expect(page.getByTestId("updates-unread")).toHaveCount(0);
	await page.getByRole("button", { name: /What’s new/ }).click();
	await page.mouse.click(600, 30);
	await expect(
		page.getByRole("dialog", { name: "What’s new", exact: true }),
	).not.toBeVisible();
});

test("the panel fits small screens, scrolls independently and passes light/dark accessibility checks", async ({
	page,
}) => {
	await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
	await page.goto("/");
	for (const width of [320, 768]) {
		await page.setViewportSize({ width, height: 720 });
		for (const theme of ["light", "dark"]) {
			if (theme === "dark")
				await page.getByRole("button", { name: "Switch to dark mode" }).click();
			await page.getByRole("button", { name: /What’s new/ }).click();
			const panel = page.getByRole("dialog", {
				name: "What’s new",
				exact: true,
			});
			const bounds = (await panel.boundingBox())!;
			expect(bounds.x).toBeGreaterThanOrEqual(0);
			expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
			expect(bounds.y).toBeGreaterThanOrEqual(0);
			expect(bounds.y + bounds.height).toBeLessThanOrEqual(720);
			const scroll = panel.getByRole("region", { name: "Release notes" });
			await scroll.evaluate((element) => {
				element.scrollTop = element.scrollHeight;
			});
			await expect(
				panel.getByRole("heading", { name: "Release in your own way" }),
			).toBeInViewport();
			await expect(
				panel.getByRole("button", { name: "Got it", exact: true }),
			).toBeInViewport();
			const scan = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
				.analyze();
			expect(scan.violations).toEqual([]);
			await page.keyboard.press("Escape");
			await expect(panel).not.toBeVisible();
		}
		await page.getByRole("button", { name: "Switch to light mode" }).click();
	}
});

test("upgrades existing device storage without losing preferences or saved words", async ({
	page,
}) => {
	await page.goto("/favicon.svg");
	await page.evaluate(async () => {
		// Dexie schema version 1 is IndexedDB version 10.
		const request = indexedDB.open("aura", 10);
		request.onupgradeneeded = () => {
			request.result.createObjectStore("flags", { keyPath: "id" });
			request.result.createObjectStore("affirmations", { keyPath: "id" });
		};
		const db = await new Promise<IDBDatabase>((resolve, reject) => {
			request.onsuccess = () => resolve(request.result);
			request.onerror = () => reject(request.error);
		});
		await new Promise<void>((resolve, reject) => {
			const transaction = db.transaction(
				["flags", "affirmations"],
				"readwrite",
			);
			transaction
				.objectStore("flags")
				.put({ id: "appearance.dark", enabled: true });
			transaction
				.objectStore("flags")
				.put({ id: "_legacy_migrated", enabled: true });
			transaction
				.objectStore("affirmations")
				.put({
					id: "synthetic-saved",
					text: "Synthetic words kept before the update.",
				});
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject(transaction.error);
		});
		db.close();
	});
	await page.goto("/mirror");
	await expect(page.locator(".aura-space")).toHaveAttribute(
		"data-theme",
		"dark",
	);
	await page
		.getByRole("button", { name: "Saved words (1)", exact: true })
		.click();
	await expect(
		page.getByText("Synthetic words kept before the update."),
	).toBeVisible();
	await expect(page.getByTestId("updates-unread")).toBeVisible();
	await page.getByRole("button", { name: /What’s new/ }).click();
	await expect(
		page.getByRole("dialog", { name: "What’s new", exact: true }),
	).toBeVisible();
});
