import { liveQuery } from "dexie";
import * as z from "zod/mini";
import type { Words } from "@/domain/words";
import type { Result } from "@/domain/result";
import { responses } from "@/data/legacyWords";
import { localStore } from "@/data/localStore";

const savedWordSchema = z.object({ id: z.string().check(z.minLength(1)), text: z.optional(z.string().check(z.minLength(1))) });

export function watchSavedWords(onChange: (result: Result<readonly Words[]>) => void) {
	const subscription = liveQuery(async (): Promise<Result<readonly Words[]>> => {
		const rows = await localStore.affirmations.toArray();
		const words: Words[] = [];
		for (const row of rows) {
			const parsed = savedWordSchema.safeParse(row);
			if (!parsed.success) return { ok: false, message: "Saved words could not be read from device storage." };
			const { id, text } = parsed.data;
			if (text !== undefined) words.push({ id, text });
			else {
				const legacy = responses.find(item => item.id === id && item.id !== "quiet");
				if (legacy === undefined) return { ok: false, message: "A saved word could not be recognised on this device." };
				words.push({ id: legacy.id, text: legacy.text });
			}
		}
		return { ok: true, value: words };
	}).subscribe({
		next: onChange,
		error: () => onChange({ ok: false, message: "Saved words are unavailable because device storage could not be opened." }),
	});
	return () => subscription.unsubscribe();
}

export async function updateSavedWord(word: Words, saved: boolean): Promise<Result<null>> {
	try {
		if (saved) await localStore.affirmations.delete(word.id);
		else await localStore.affirmations.put({ id: word.id, text: word.text });
		return { ok: true, value: null };
	} catch {
		return { ok: false, message: "Could not update saved words. Your browser may have device storage disabled." };
	}
}
