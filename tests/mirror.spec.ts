import { test, expect, type Page } from "@playwright/test";

async function chooseMood(page: Page, mood: string) {
	await page.getByRole("button", { name: mood, exact: true }).click();
}

test.describe("Private Mirror", () => {
	test.use({ serviceWorkers: "block" });
	test.beforeEach(async ({ page }) => {
		await page.route("**/api/reflect", (route) => route.fulfill({ json: { text: "A gentle AI response." } }));
	});
	test("finishes a release from the acknowledgment screen", async ({
		page,
	}) => {
		await page.goto("/mirror");
		const release = page.getByRole("button", { name: "Release", exact: true });
		await expect(release).toBeDisabled();
		await page.getByRole("textbox").fill(" ");
		await expect(release).toBeDisabled();
		await chooseMood(page, "Okay");
		await expect(release).toBeEnabled();
		await page.getByRole("button", { name: "Clear selected feelings" }).click();
		await expect(release).toBeDisabled();
		await page.getByRole("textbox").fill("A passing thought");
		await expect(release).toBeEnabled();
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { level: 2 })).toBeFocused();
		await expect(
			page.getByRole("link", { name: "Done for now", exact: true }),
		).toBeVisible();
		await page.getByRole("link", { name: "Done for now", exact: true }).click();
		await expect(page).toHaveURL("/");
		await chooseMood(page, "Okay");
		await page.getByRole("button", { name: "Continue", exact: true }).click();
		await expect(page.getByRole("textbox")).toHaveValue("");
	});

	test("hands moods from Greeting to Mirror once and clears repeat expression", async ({
		page,
	}) => {
		await page.goto("/");
		await chooseMood(page, "Overwhelmed");
		await chooseMood(page, "Tired");
		await page.getByRole("button", { name: "Continue" }).click();
		await expect(
			page.getByRole("button", {
				name: "Overwhelmed",
				exact: true,
				includeHidden: true,
			}),
		).toHaveAttribute("aria-pressed", "true");
		await expect(
			page.getByRole("button", {
				name: "Tired",
				exact: true,
				includeHidden: true,
			}),
		).toHaveAttribute("aria-pressed", "true");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
		await page.goto("/mirror");
		await expect(
			page.getByRole("button", {
				name: "Overwhelmed",
				exact: true,
				includeHidden: true,
			}),
		).toHaveAttribute("aria-pressed", "false");
		await page.reload();
		await expect(
			page.getByRole("button", {
				name: "Tired",
				exact: true,
				includeHidden: true,
			}),
		).toHaveAttribute("aria-pressed", "false");
	});

	test("clearing greeting feelings and direct entry start without moods", async ({
		page,
	}) => {
		await page.goto("/");
		await expect(
			page.getByRole("button", { name: "Continue", exact: true }),
		).toBeDisabled();
		await chooseMood(page, "Low");
		await expect(
			page.getByRole("button", { name: "Continue", exact: true }),
		).toBeEnabled();
		await page
			.getByRole("button", { name: "Clear selected feelings", exact: true })
			.click();
		await expect(
			page.getByRole("button", {
				name: "Clear selected feelings",
				exact: true,
			}),
		).toBeDisabled();
		await expect(
			page.getByRole("button", { name: "Continue", exact: true }),
		).toBeDisabled();
		await page.getByRole("link", { name: "Mirror", exact: true }).click();
		await expect(
			page.getByRole("button", {
				name: "Low",
				exact: true,
				includeHidden: true,
			}),
		).toHaveAttribute("aria-pressed", "false");
		await page.goto("/mirror");
		await expect(
			page.getByRole("button", {
				name: "Low",
				exact: true,
				includeHidden: true,
			}),
		).toHaveAttribute("aria-pressed", "false");
	});

	test("protects drafts on navigation and restores writing focus after Escape", async ({
		page,
	}) => {
		await page.goto("/mirror");
		const draft = page.getByRole("textbox");
		await draft.fill("Private unfinished draft");
		await page.getByRole("button", { name: "Settings", exact: true }).click();
		await expect(
			page.getByRole("dialog", { name: "Settings", exact: true }),
		).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(
			page.getByRole("dialog", { name: "Settings", exact: true }),
		).not.toBeVisible();
		await expect(draft).toHaveValue("Private unfinished draft");
		await page.getByRole("link", { name: "Home", exact: true }).click();
		await expect(
			page.getByRole("dialog", { name: "Leave this writing behind?" }),
		).toBeVisible();
		await page.keyboard.press("Escape");
		await expect(draft).toBeFocused();
		await expect(draft).toHaveValue("Private unfinished draft");
		await page.getByRole("link", { name: "Home", exact: true }).click();
		await page.getByRole("button", { name: "Discard and leave" }).click();
		if (
			await page
				.getByRole("dialog", { name: "Settings", exact: true })
				.isVisible()
		)
			await page.getByRole("button", { name: "Close settings" }).click();
		await page.getByRole("link", { name: "Mirror", exact: true }).click();
		await expect(draft).toHaveValue("");
	});

	test("keeps the draft in memory, sends it only on release, and saves only the response", async ({
		page,
	}) => {
		const requests: string[] = [];
		page.on("request", (request) =>
			requests.push(request.url() + (request.postData() ?? "")),
		);
		await page.goto("/mirror");
		await page.getByRole("textbox").fill("PRIVATE_SENTINEL_aura_2026");
		await page
			.getByRole("button", { name: "Saved words (0)", exact: true })
			.click();
		await page
			.getByRole("button", { name: "Back to Mirror", exact: true })
			.click();
		await expect(page.getByRole("textbox")).toHaveValue(
			"PRIVATE_SENTINEL_aura_2026",
		);
		await chooseMood(page, "Overwhelmed");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { level: 2 })).toBeFocused();
		await page.getByRole("button", { name: "Save words", exact: true }).click();
		await expect(
			page.getByRole("button", { name: "Saved", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
		const stored = await page.evaluate(async () => {
			const db = await new Promise<IDBDatabase>((resolve, reject) => {
				const request = indexedDB.open("aura");
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			const rows = await new Promise<unknown[]>((resolve, reject) => {
				const request = db
					.transaction("affirmations")
					.objectStore("affirmations")
					.getAll();
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			const flags = await new Promise<unknown[]>((resolve, reject) => {
				const request = db.transaction("flags").objectStore("flags").getAll();
				request.onsuccess = () => resolve(request.result);
				request.onerror = () => reject(request.error);
			});
			db.close();
			return {
				rows,
				flags,
				history: history.state,
				local: { ...localStorage },
				session: { ...sessionStorage },
			};
		});
		expect(stored.rows).toEqual([{ id: expect.any(String), text: "A gentle AI response." }]);
		expect(JSON.stringify(stored)).not.toContain("PRIVATE_SENTINEL_aura_2026");
		expect(requests.filter((request) => request.includes("PRIVATE_SENTINEL_aura_2026"))).toHaveLength(1);
		expect(requests.find((request) => request.includes("PRIVATE_SENTINEL_aura_2026"))).toContain("/api/reflect");
		await page.reload();
		await page
			.getByRole("button", { name: "Saved words (1)", exact: true })
			.click();
		await expect(
			page.getByText(
				"A gentle AI response.",
				{ exact: true },
			),
		).toBeVisible();
		await page.getByRole("button", { name: "Remove affirmation:" }).click();
		await expect(
			page.getByText("Nothing saved yet.", { exact: false }),
		).toBeVisible();
	});

	test("starts with gentle words despite legacy quiet preference and supports reset", async ({
		page,
	}) => {
		await page.addInitScript(() =>
			localStorage.setItem("aura.support.quiet", "true"),
		);
		await page.goto("/mirror");
		await expect(
			page.getByRole("button", { name: "Gentle words", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
		await page
			.getByRole("button", { name: "Just let me release", exact: true })
			.click();
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(
			page.getByRole("heading", { name: "Released.", exact: true }),
		).toBeVisible();
		await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
		await page.goto("/mirror");
		await expect(
			page.getByRole("button", { name: "Gentle words", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
		await page.getByRole("button", { name: "Settings", exact: true }).click();
		if (
			!(await page
				.getByRole("button", { name: "Clear device data", exact: true })
				.isVisible())
		)
			await page.getByText("Privacy & device", { exact: true }).click();
		await page
			.getByRole("button", { name: "Clear device data", exact: true })
			.click();
		await page
			.getByRole("button", { name: "Keep my data", exact: true })
			.click();
		await expect(
			page.getByRole("button", { name: "Clear device data", exact: true }),
		).toBeFocused();
		await page
			.getByRole("button", { name: "Clear device data", exact: true })
			.click();
		await page.getByRole("button", { name: "Clear data", exact: true }).click();
		await expect(
			page.getByText("Saved words removed. Your preferences are reset."),
		).toBeVisible();
		await page.reload();
		if (
			await page
				.getByRole("dialog", { name: "Settings", exact: true })
				.isVisible()
		)
			await page.getByRole("button", { name: "Close settings" }).click();
		await page.getByRole("link", { name: "Mirror", exact: true }).click();
		await expect(
			page.getByRole("button", { name: "Gentle words", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
	});

	test("keeps Mirror usable when IndexedDB is unavailable", async ({
		page,
	}) => {
		await page.addInitScript(() => {
			IDBFactory.prototype.open = () => {
				throw new DOMException("Unavailable", "SecurityError");
			};
		});
		await page.goto("/mirror");
		await expect(
			page.getByRole("button", { name: "Gentle words", exact: true }),
		).toHaveAttribute("aria-pressed", "true");
		await page
			.getByRole("button", { name: "Gentle words", exact: true })
			.click();
		await page.getByRole("textbox").fill("Writing without device storage");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(
			page.getByRole("link", { name: "Done for now" }),
		).toBeVisible();
		await page.getByRole("button", { name: "Save words", exact: true }).click();
		await expect(
			page.getByText("Could not update saved words.", { exact: false }),
		).toBeVisible();
	});

	test("synchronizes motion preferences across tabs and saves rapid toggles", async ({
		page,
		context,
	}) => {
		await page.goto("/mirror");
		const settings = await context.newPage();
		await settings.goto("/settings");
		const motion = settings.getByRole("switch", {
			name: "Reduce motion",
			exact: true,
		});
		await motion.click();
		await expect(page.locator("section[data-reduced-motion]")).toHaveAttribute(
			"data-reduced-motion",
			"true",
		);
		for (let index = 0; index < 4; index++) await motion.click();
		await expect(
			settings
				.getByRole("status")
				.filter({ hasText: "Changes are saved on this device." })
				.first(),
		).toBeVisible();
		await settings.reload();
		await expect(motion).toHaveAttribute("aria-checked", "true");
		await expect(page.locator("section[data-reduced-motion]")).toHaveAttribute(
			"data-reduced-motion",
			"true",
		);
	});

	test("sends each selected feeling and mixed feelings to AI", async ({ page }) => {
		const sent: string[][] = [];
		await page.route("**/api/reflect", (route) => {
			sent.push(route.request().postDataJSON().moods);
			return route.fulfill({ json: { text: "A response from AI." } });
		});
		await page.goto("/mirror");
		for (const mood of ["Overwhelmed", "Low", "Tired", "Anxious", "Okay", "Hopeful", "Content"]) {
			await chooseMood(page, mood);
			await page.getByRole("button", { name: "Release", exact: true }).click();
			await expect(page.getByRole("heading", { level: 2 })).toHaveText("A response from AI.");
			expect(sent.at(-1)).toEqual([mood]);
			await expect(page.getByRole("heading", { level: 2 })).toBeVisible();
		await page.goto("/mirror");
		}
		await chooseMood(page, "Low");
		await chooseMood(page, "Overwhelmed");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { level: 2 })).toHaveText("A response from AI.");
		expect(sent.at(-1)).toEqual(["Low", "Overwhelmed"]);
	});

	test("rolls back a failed reset and preserves unrelated storage", async ({
		page,
	}) => {
		await page.goto("/mirror");
		await page.evaluate(() =>
			localStorage.setItem("unrelated.preference", "keep"),
		);
		await chooseMood(page, "Low");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await page.getByRole("button", { name: "Save words", exact: true }).click();
		await expect(
			page.getByRole("button", { name: "Saved words (1)", exact: true }),
		).toBeVisible();
		await page.getByRole("button", { name: "Settings", exact: true }).click();
		if (
			!(await page
				.getByRole("button", { name: "Clear device data", exact: true })
				.isVisible())
		)
			await page.getByText("Privacy & device", { exact: true }).click();
		await page.evaluate(() => {
			const original = IDBObjectStore.prototype.clear;
			IDBObjectStore.prototype.clear = function () {
				if (this.name === "affirmations") {
					IDBObjectStore.prototype.clear = original;
					throw new DOMException("Simulated reset failure", "AbortError");
				}
				return original.call(this);
			};
		});
		await page
			.getByRole("button", { name: "Clear device data", exact: true })
			.click();
		await page.getByRole("button", { name: "Clear data", exact: true }).click();
		await expect(
			page.getByText("Could not finish clearing device data.", {
				exact: false,
			}),
		).toBeVisible();
		if (
			await page
				.getByRole("dialog", { name: "Settings", exact: true })
				.isVisible()
		)
			await page.getByRole("button", { name: "Close settings" }).click();
		await page.getByRole("link", { name: "Mirror", exact: true }).click();
		await expect(
			page.getByRole("button", { name: "Saved words (1)", exact: true }),
		).toBeVisible();
		expect(
			await page.evaluate(() => localStorage.getItem("unrelated.preference")),
		).toBe("keep");
		await page.getByRole("button", { name: "Settings", exact: true }).click();
		if (
			!(await page
				.getByRole("button", { name: "Clear device data", exact: true })
				.isVisible())
		)
			await page.getByText("Privacy & device", { exact: true }).click();
		await page
			.getByRole("button", { name: "Clear device data", exact: true })
			.click();
		await page.getByRole("button", { name: "Clear data", exact: true }).click();
		await expect(
			page.getByText("Saved words removed. Your preferences are reset."),
		).toBeVisible();
		if (
			await page
				.getByRole("dialog", { name: "Settings", exact: true })
				.isVisible()
		)
			await page.getByRole("button", { name: "Close settings" }).click();
		await page.getByRole("link", { name: "Mirror", exact: true }).click();
		await expect(
			page.getByRole("button", { name: "Saved words (0)", exact: true }),
		).toBeVisible();
		expect(
			await page.evaluate(() => localStorage.getItem("unrelated.preference")),
		).toBe("keep");
	});
});
