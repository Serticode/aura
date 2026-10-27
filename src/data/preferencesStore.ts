import { liveQuery } from "dexie";
import * as z from "zod/mini";
import { emptyPreferences, type Preferences, type PreferenceKey } from "@/domain/preferences";
import type { Result } from "@/domain/result";
import { migrateLegacyPreferences, localStore } from "@/data/localStore";

const flagSchema = z.object({
	id: z.enum(Object.keys(emptyPreferences) as [PreferenceKey, ...PreferenceKey[]]),
	enabled: z.boolean(),
});

export async function initializePreferences(): Promise<Result<Preferences>> {
	try {
		await migrateLegacyPreferences();
		return await readPreferences();
	} catch {
		return { ok: false, message: "Device storage is unavailable. Changes apply only while this page is open." };
	}
}

export async function readPreferences(): Promise<Result<Preferences>> {
	try {
		const rows = await localStore.flags.toArray();
		const flags = { ...emptyPreferences };
		for (const row of rows) {
			if (row.id === "_legacy_migrated") continue;
			const parsed = flagSchema.safeParse(row);
			if (!parsed.success) return { ok: false, message: "Device preferences could not be read. Changes apply only while this page is open." };
			flags[parsed.data.id] = parsed.data.enabled;
		}
		return { ok: true, value: flags };
	} catch {
		return { ok: false, message: "Device storage is unavailable. Changes apply only while this page is open." };
	}
}

export function watchPreferences(onChange: (result: Result<Preferences>) => void) {
	const subscription = liveQuery(readPreferences).subscribe({
		next: onChange,
		error: () => onChange({ ok: false, message: "Device storage is unavailable. Changes apply only while this page is open." }),
	});
	return () => subscription.unsubscribe();
}

export async function writePreference(id: PreferenceKey, enabled: boolean): Promise<Result<null>> {
	try {
		await localStore.flags.put({ id, enabled });
		return { ok: true, value: null };
	} catch {
		return { ok: false, message: "Could not save this change. It applies only while this page is open." };
	}
}
