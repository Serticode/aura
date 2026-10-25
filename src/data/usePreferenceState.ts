import { loadFlags, localStore } from "@/data/localStore";
import { liveQuery } from "dexie";
import { useEffect, useRef, useState } from "react";

export function usePreferenceState() {
	const [flags, setFlags] = useState<Readonly<Record<string, boolean>>>({});
	const [ready, setReady] = useState(false);
	const revision = useRef(0);
	const writes = useRef(0);
	const [saveStatus, setSaveStatus] = useState("Loading your preferences…");
	useEffect(() => {
		let active = true;
		let unsubscribe = () => {};
		function unavailable() {
			if (active) {
				setSaveStatus(
					"Device storage is unavailable. Changes apply only while this page is open.",
				);
				setReady(true);
			}
		}
		loadFlags()
			.then(() => {
				if (!active) return;
				const subscription = liveQuery(async () => {
					const version = revision.current;
					return { rows: await localStore.flags.toArray(), version };
				}).subscribe({
					next: ({ rows, version }) => {
						if (writes.current > 0 || version !== revision.current) return;
						setFlags(
							Object.fromEntries(rows.map(({ id, enabled }) => [id, enabled])),
						);
						setSaveStatus("Changes are saved on this device.");
						setReady(true);
					},
					error: unavailable,
				});
				unsubscribe = () => subscription.unsubscribe();
			})
			.catch(unavailable);
		return () => {
			active = false;
			unsubscribe();
		};
	}, []);

	async function setFlag(id: string, enabled: boolean) {
		revision.current++;
		writes.current++;
		setSaveStatus("Saving…");
		setFlags((current) => ({ ...current, [id]: enabled }));
		let saved = false;
		try {
			await localStore.flags.put({ id, enabled });
			saved = true;
		} catch {
			setSaveStatus(
				"Could not save this change. It applies only while this page is open.",
			);
		} finally {
			writes.current--;
			const version = ++revision.current;
			if (saved && writes.current === 0) {
				try {
					const rows = await localStore.flags.toArray();
					if (version === revision.current) {
						setFlags(
							Object.fromEntries(rows.map(({ id, enabled }) => [id, enabled])),
						);
						setSaveStatus("Changes are saved on this device.");
					}
				} catch {
					// Keep the current session choices when device storage is unavailable.
				}
			}
		}
	}

	return { flags, ready, setFlag, saveStatus };
}
