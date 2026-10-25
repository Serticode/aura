import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { test as base, expect } from "@playwright/test";

interface CandidateServer {
	readonly url: string;
	readonly publish: (version: string) => void;
	readonly failUpdates: (fail: boolean) => void;
}

const test = base.extend<{ candidate: CandidateServer }>({
	candidate: async ({ baseURL }, provide) => {
		if (!baseURL) throw new Error("Expected configured preview URL");
		let version = "initial";
		let fail = false;
		const types: Readonly<Record<string, string>> = {
			".js": "application/javascript",
			".html": "text/html",
			".css": "text/css",
			".json": "application/json",
			".webmanifest": "application/manifest+json",
			".png": "image/png",
			".svg": "image/svg+xml",
			".woff2": "font/woff2",
		};
		const headerFile = await readFile("public/_headers", "utf8");
		const headers = Object.fromEntries(
			headerFile
				.split("\n")
				.filter(
					(line) =>
						line.startsWith(" ") && !line.trim().startsWith("Cache-Control"),
				)
				.map((line) => {
					const colon = line.indexOf(":");
					return [line.slice(0, colon).trim(), line.slice(colon + 1).trim()];
				}),
		);
		const server = createServer(async (request, response) => {
			const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
			const asset = extname(pathname) ? pathname : "/index.html";
			if (asset === "/sw.js" && fail) {
				response.writeHead(503);
				response.end();
				return;
			}
			try {
				let body = await readFile(resolve("dist", `.${asset}`));
				if (asset === "/sw.js")
					body = Buffer.from(
						body
							.toString()
							.replace(
								/url:"index.html",revision:"[^"]+"/,
								`url:"index.html",revision:"${version}"`,
							),
					);
				if (asset === "/index.html")
					body = Buffer.from(
						body
							.toString()
							.replace(
								"</head>",
								`<meta name="candidate-version" content="${version}"></head>`,
							),
					);
				response.writeHead(200, {
					...headers,
					"Content-Type": types[extname(asset)] ?? "application/octet-stream",
					"Cache-Control": "no-store",
				});
				response.end(body);
			} catch {
				response.writeHead(404);
				response.end();
			}
		});
		await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
		const address = server.address();
		if (address === null || typeof address === "string")
			throw new Error("Expected TCP test server");
		await provide({
			url: `http://127.0.0.1:${address.port}`,
			publish: (next) => {
				version = next;
			},
			failUpdates: (next) => {
				fail = next;
			},
		});
		await new Promise<void>((done, reject) =>
			server.close((error) => (error ? reject(error) : done())),
		);
	},
});

test.describe("Production PWA", () => {
	test("serves direct routes, install metadata, icons, and security headers", async ({
		request,
		candidate,
	}) => {
		for (const route of ["/mirror", "/settings"]) {
			const response = await request.get(`${candidate.url}${route}`);
			expect(response.status()).toBe(200);
			expect(response.headers()["content-security-policy"]).toContain(
				"script-src 'self'",
			);
			expect(response.headers()["x-content-type-options"]).toBe("nosniff");
			expect(response.headers()["referrer-policy"]).toBe("no-referrer");
		}
		const response = await request.get(`${candidate.url}/manifest.webmanifest`);
		const manifest: unknown = await response.json();
		expect(manifest).toMatchObject({
			name: "Aura",
			display: "standalone",
			start_url: "/",
		});
		for (const icon of [
			"pwa-192x192.png",
			"pwa-512x512.png",
			"apple-touch-icon.png",
		]) {
			expect((await request.get(`${candidate.url}/${icon}`)).status()).toBe(
				200,
			);
		}
	});

	test("preserves writing when AI is offline, supports quiet release, and retains legacy saved words", async ({
		page,
		context,
		candidate,
	}) => {
		await page.goto(`${candidate.url}/mirror`);
		await page.evaluate(() =>
			navigator.serviceWorker.ready.then(() => undefined),
		);
		await page.reload();
		await expect
			.poll(() =>
				page.evaluate(() => navigator.serviceWorker.controller !== null),
			)
			.toBe(true);
		await context.setOffline(true);
		await page.reload();
		await page.getByRole("textbox").fill("An offline thought");
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("textbox")).toHaveValue("An offline thought");
		await expect(page.getByRole("status").filter({ hasText: "Could not reach AI" })).toBeVisible();
		await page.getByRole("button", { name: "Just let me release", exact: true }).click();
		await page.getByRole("button", { name: "Release", exact: true }).click();
		await expect(page.getByRole("heading", { name: "Released.", exact: true })).toBeVisible();
		await page.evaluate(async () => {
			const db = await new Promise<IDBDatabase>((resolve, reject) => {
				const open = indexedDB.open("aura");
				open.onsuccess = () => resolve(open.result);
				open.onerror = () => reject(open.error);
			});
			await new Promise<void>((resolve, reject) => {
				const transaction = db.transaction("affirmations", "readwrite");
				transaction.objectStore("affirmations").put({ id: "neutral" });
				transaction.oncomplete = () => resolve();
				transaction.onerror = () => reject(transaction.error);
			});
			db.close();
		});
		await page.reload();
		await page
			.getByRole("button", { name: "Saved words (1)", exact: true })
			.click();
		await expect(
			page.getByText("Thank you for making space for what you feel.", {
				exact: true,
			}),
		).toBeVisible();
	});

	test("waits for explicit updates, preserves another tab draft, and supports rollback", async ({
		page,
		context,
		candidate,
	}) => {
		await page.goto(`${candidate.url}/settings`);
		await page.evaluate(() =>
			navigator.serviceWorker.ready.then(() => undefined),
		);
		const writer = await context.newPage();
		await writer.goto(`${candidate.url}/mirror`);
		await writer
			.getByRole("textbox")
			.fill("Keep this draft through another tab update");
		candidate.publish("second");
		await page.evaluate(async () => {
			const registration = await navigator.serviceWorker.ready;
			await registration.update();
		});
		await expect(
			page.getByRole("button", { name: "Update Aura", exact: true }),
		).toBeVisible();
		await expect(writer.getByRole("textbox")).toHaveValue(
			"Keep this draft through another tab update",
		);
		await page
			.getByRole("button", { name: "Update Aura", exact: true })
			.click();
		await expect(
			page.locator('meta[name="candidate-version"]'),
		).toHaveAttribute("content", "second");
		await expect(writer.getByRole("textbox")).toHaveValue(
			"Keep this draft through another tab update",
		);
		candidate.publish("initial");
		await page.evaluate(async () => {
			const registration = await navigator.serviceWorker.ready;
			await registration.update();
		});
		await expect(
			page.getByRole("button", { name: "Update Aura", exact: true }),
		).toBeVisible();
		await page
			.getByRole("button", { name: "Update Aura", exact: true })
			.click();
		await expect(
			page.locator('meta[name="candidate-version"]'),
		).toHaveAttribute("content", "initial");
		await expect(writer.getByRole("textbox")).toHaveValue(
			"Keep this draft through another tab update",
		);
	});

	test("retains the working app after an update fetch fails", async ({
		page,
		candidate,
	}) => {
		await page.goto(`${candidate.url}/mirror`);
		await page.evaluate(() =>
			navigator.serviceWorker.ready.then(() => undefined),
		);
		await page.getByRole("textbox").fill("Keep writing while updates fail");
		candidate.failUpdates(true);
		const failed = await page.evaluate(async () => {
			const registration = await navigator.serviceWorker.ready;
			try {
				await registration.update();
				return false;
			} catch {
				return true;
			}
		});
		expect(failed).toBe(true);
		await expect(page.getByRole("textbox")).toHaveValue(
			"Keep writing while updates fail",
		);
		candidate.failUpdates(false);
		candidate.publish("recovered");
		await page.evaluate(async () => {
			const registration = await navigator.serviceWorker.ready;
			await registration.update();
		});
		await expect(
			page.getByRole("button", { name: "Update in Settings" }),
		).toBeVisible();
	});
});
