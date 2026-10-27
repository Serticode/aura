import type { Mood } from "@/domain/moods";
import { reflectionResponseSchema } from "@/contracts/reflection";

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
			return { ok: false, message: "Please wait a minute before trying again. Your writing is still here." };
		}
		if (!response.ok) {
			return { ok: false, message: "Responses are unavailable right now. Your writing is still here. Please try again shortly." };
		}
		const parsed = reflectionResponseSchema.safeParse(await response.json());
		if (!parsed.success) {
			return { ok: false, message: "Your reflection could not be completed. Your writing is still here." };
		}
		return { ok: true, text: parsed.data.text };
	} catch {
		return { ok: false, message: "Could not connect to Aura. Your writing is still here; you can try again." };
	}
}
