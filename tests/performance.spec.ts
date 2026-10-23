import { test, expect } from "@playwright/test";

test.describe("Desktop diagnostic measurements", () => {
	test("records cold load, acknowledgment latency, and frame intervals", async ({
		page,
		browserName,
		browser,
	}) => {
		test.setTimeout(60_000);
		test.skip(
			browserName !== "chromium",
			"Record one controlled desktop diagnostic; physical-device measurement remains manual.",
		);
		await page.goto("/mirror");
		await expect(
			page.getByRole("button", { name: "Release", exact: true }),
		).toBeEnabled();
		const load = await page.evaluate(() => ({
			navigationMs: performance.getEntriesByType("navigation")[0]?.duration,
			firstContentfulPaintMs: performance.getEntriesByName(
				"first-contentful-paint",
			)[0]?.startTime,
		}));
		const samples: number[] = [];
		for (let index = 0; index < 20; index++) {
			await page.getByRole("textbox").fill("Synthetic performance check");
			samples.push(
				await page.evaluate(
					() =>
						new Promise<number>((done) => {
							const button = Array.from(
								document.querySelectorAll("button"),
							).find((item) => item.textContent?.trim().startsWith("Release"))!;
							const start = performance.now();
							const observer = new MutationObserver(() => {
								if (
									document
										.querySelector('[role="status"]')
										?.textContent?.includes("Released.")
								) {
									observer.disconnect();
									requestAnimationFrame(() => done(performance.now() - start));
								}
							});
							observer.observe(document.body, {
								childList: true,
								subtree: true,
							});
							button.click();
						}),
				),
			);
			await page.getByRole("button", { name: "Write again" }).click();
		}
		const frameIntervals = await page.evaluate(
			() =>
				new Promise<number[]>((done) => {
					const intervals: number[] = [];
					let previous = performance.now();
					function sample(now: number) {
						intervals.push(now - previous);
						previous = now;
						if (intervals.length === 120) done(intervals);
						else requestAnimationFrame(sample);
					}
					requestAnimationFrame(sample);
				}),
		);
		samples.sort((left, right) => left - right);
		frameIntervals.sort((left, right) => left - right);
		const acknowledgmentP95Ms = samples[18]!;
		const report = {
			environment:
				"Headless desktop Chromium, localhost, unthrottled, fresh browser context; not reference-phone evidence",
			browser: browser.version(),
			...load,
			samples: samples.length,
			acknowledgmentP95Ms: Math.round(acknowledgmentP95Ms * 10) / 10,
			frameIntervalP95Ms: Math.round(frameIntervals[113]! * 10) / 10,
		};
		console.info(`Pilot diagnostic: ${JSON.stringify(report)}`);
		expect(acknowledgmentP95Ms).toBeLessThan(300);
	});
});
