import { test, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { reflect, type Env } from "../worker/reflect.ts";
import { fetch as workerFetch } from "../worker/index.ts";

afterEach(() => mock.restoreAll());

function environment(): Env {
	return {
		AI_ENABLED: "true",
		ATRIA_API_KEY: "synthetic-test-key",
		ATRIA_MODEL: "Atria-Dawn",
		REFLECTION_LIMITER: { limit: async () => ({ success: true }) },
		ASSETS: { fetch: async () => new Response("synthetic asset") },
	};
}

function request(body: string, origin = "https://aura.example") {
	return new Request("https://aura.example/api/reflect", {
		method: "POST",
		headers: { origin, "CF-Connecting-IP": "192.0.2.1", "Content-Type": "application/json" },
		body,
	});
}

const validInput = JSON.stringify({ writing: "A synthetic passing thought", moods: ["Okay"] });

test("disabled AI and rejected origins never contact the provider", async () => {
	const env = environment();
	const fetchMock = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected network request"); });
	assert.equal((await reflect(request(validInput), { ...env, AI_ENABLED: "false" })).status, 503);
	assert.equal((await reflect(request(validInput, "https://other.example"), env)).status, 403);
	assert.equal(fetchMock.mock.callCount(), 0);
});

test("rate limits and failed limiter bindings stop provider calls", async () => {
	const env = environment();
	const fetchMock = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected network request"); });
	assert.equal((await reflect(request(validInput), { ...env, REFLECTION_LIMITER: { limit: async () => ({ success: false }) } })).status, 429);
	assert.equal((await reflect(request(validInput), { ...env, REFLECTION_LIMITER: { limit: async () => { throw new Error("Unavailable"); } } })).status, 503);
	assert.equal(fetchMock.mock.callCount(), 0);
});

test("unknown fields, unknown feelings, oversized bodies, and malformed JSON are rejected", async () => {
	const fetchMock = mock.method(globalThis, "fetch", async () => { throw new Error("Unexpected network request"); });
	for (const body of ["{", JSON.stringify({ writing: "Hi", moods: [], unexpected: true }), JSON.stringify({ writing: "Hi", moods: ["unknown"] }), JSON.stringify({ writing: " ", moods: [] }), JSON.stringify({ writing: "x".repeat(8001), moods: [] })]) {
		assert.equal((await reflect(request(body), environment())).status, 400);
	}
	assert.equal((await reflect(request("x".repeat(40001)), environment())).status, 413);
	assert.equal(fetchMock.mock.callCount(), 0);
});

test("a reflection uses the Atria endpoint, server-selected instructions, model, and token cap", async () => {
	const calls: { url: string; body: string }[] = [];
	mock.method(globalThis, "fetch", async (url: string | URL | Request, init: RequestInit) => {
		calls.push({ url: String(url), body: typeof init.body === "string" ? init.body : "" });
		return Response.json({ choices: [{ finish_reason: "stop", message: { content: "There is room for that feeling." } }] });
	});
	const response = await reflect(request(validInput), environment());
	assert.equal(response.status, 200);
	assert.equal(response.headers.get("cache-control"), "no-store");
	assert.deepEqual(await response.json(), { text: "There is room for that feeling." });
	assert.equal(calls.length, 1);
	assert.equal(calls[0]!.url, "https://api.atria-asi.ai/v1/chat/completions");
	const provider = JSON.parse(calls[0]!.body);
	assert.equal(provider.model, "Atria-Dawn");
	assert.equal(provider.max_tokens, 400);
	assert.equal(provider.stream, false);
	assert.match(provider.messages[0].content, /Do not diagnose/);
	assert.equal(JSON.parse(provider.messages[1].content).writing, "A synthetic passing thought");
});

test("provider errors and incomplete replies return generic messages without leaking content", async () => {
	mock.method(globalThis, "fetch", async () => Response.json({ error: { message: "synthetic-test-key A synthetic passing thought" } }, { status: 401 }));
	const response = await reflect(request(validInput), environment());
	assert.equal(response.status, 502);
	assert.doesNotMatch(await response.text(), /synthetic-test-key|A synthetic passing thought/);
	mock.restoreAll();
	mock.method(globalThis, "fetch", async () => Response.json({ choices: [{ finish_reason: "length", message: { content: "Incomplete" } }] }));
	assert.equal((await reflect(request(validInput), environment())).status, 502);
});

test("Worker routing serves assets and rejects unknown API routes and methods", async () => {
	const env = environment();
	assert.equal(await (await workerFetch(new Request("https://aura.example/"), env)).text(), "synthetic asset");
	assert.equal((await workerFetch(new Request("https://aura.example/api/missing"), env)).status, 404);
	assert.equal((await workerFetch(new Request("https://aura.example/api/reflect"), env)).status, 405);
});

 test("provider quota exhaustion is distinguished from a per-person rate limit", async () => {
	mock.method(globalThis, "fetch", async () => Response.json({ error: { code: "insufficient_quota" } }, { status: 429 }));
	const response = await reflect(request(validInput), environment());
	assert.equal(response.status, 503);
	assert.deepEqual(await response.json(), { code: "provider_quota", error: "Responses are temporarily unavailable. Your writing is still here." });
 });
