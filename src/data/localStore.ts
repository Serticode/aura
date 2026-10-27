import Dexie, { type EntityTable } from "dexie";
import { supportIds } from "@/domain/preferences";

interface Flag {
	readonly id: string;
	readonly enabled: boolean;
}
interface SavedAffirmation {
	readonly id: string;
	// Older curated records contain only an identifier.
	readonly text?: string;
}

export const localStore = new Dexie("aura") as Dexie & {
	flags: EntityTable<Flag, "id">;
	affirmations: EntityTable<SavedAffirmation, "id">;
};
localStore.version(1).stores({ flags: "id", affirmations: "id" });

export async function migrateLegacyPreferences(): Promise<void> {
	await localStore.transaction("rw", localStore.flags, async () => {
		if (await localStore.flags.get("_legacy_migrated")) return;
		const flags: Flag[] = [];
		try {
			for (const id of supportIds)
				flags.push({
					id: `support.${id}`,
					enabled: localStorage.getItem(`aura.support.${id}`) === "true",
				});
			flags.push({
				id: "sounds",
				enabled: localStorage.getItem("aura.sounds") === "true",
			});
		} catch {
			// Browser storage may be unavailable; IndexedDB remains the preferred store.
		}
		await localStore.flags.bulkPut([...flags, { id: "_legacy_migrated", enabled: true }]);
	});
}

export type ClearDataResult =
	| { readonly status: "complete" }
	| { readonly status: "device-cleared" }
	| { readonly status: "legacy-cleared" }
	| { readonly status: "error" };

export async function clearLocalData(): Promise<ClearDataResult> {
	let legacyCleared = true;
	try {
		for (const id of supportIds) localStorage.removeItem(`aura.support.${id}`);
		localStorage.removeItem("aura.sounds");
	} catch {
		legacyCleared = false;
	}
	try {
		await localStore.transaction("rw", localStore.flags, localStore.affirmations, async () => {
			await localStore.flags.clear();
			await localStore.affirmations.clear();
			// Prevent old preferences returning even when legacy storage cannot be accessed.
			await localStore.flags.put({ id: "_legacy_migrated", enabled: true });
		});
		return { status: legacyCleared ? "complete" : "device-cleared" };
	} catch {
		return { status: legacyCleared ? "legacy-cleared" : "error" };
	}
}
