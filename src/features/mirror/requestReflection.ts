import type { Mood } from "@/app/moods";

type ReflectionResult =
	| { readonly ok: true; readonly text: string }
	| { readonly ok: false; readonly message: string };

export async function requestReflection(
	writing: string,
	moods: readonly Mood[],
	signal: AbortSignal,
): Promise<ReflectionResult> {
	try {
		const response = await fetch("/api/reflect", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ writing, moods }),
			signal,
			cache: "no-store",
		});
		if (response.status === 429) {
			return { ok: false, message: "Please wait a minute before trying AI again. Your writing is still here." };
		}
		if (!response.ok) {
			return { ok: false, message: "Responses are unavailable right now. Your writing is still here. Please try again shortly." };
		}
		const data: unknown = await response.json();
		if (typeof data !== "object" || data === null || !("text" in data) || typeof data.text !== "string" || data.text.trim().length === 0) {
			return { ok: false, message: "AI could not complete this reflection. Your writing is still here." };
		}
		return { ok: true, text: data.text };
	} catch {
		return { ok: false, message: "Could not reach AI. Your writing is still here; you can try again." };
	}
}
