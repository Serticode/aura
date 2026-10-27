import { useEffect, useRef, useState } from "react";
import { emptyPreferences, type Preferences, type PreferenceKey } from "@/domain/preferences";
import type { Result } from "@/domain/result";
import { initializePreferences, readPreferences, watchPreferences, writePreference } from "@/data/preferencesStore";

type PreferenceState =
	| { readonly status: "loading"; readonly flags: Preferences }
	| { readonly status: "saved" | "saving"; readonly flags: Preferences }
	| { readonly status: "session"; readonly flags: Preferences; readonly message: string };

interface SessionChoice {
	readonly enabled: boolean;
	readonly revision: number;
}

function statusMessage(state: PreferenceState): string {
	switch (state.status) {
		case "loading": return "Loading your preferences…";
		case "saved": return "Changes are saved on this device.";
		case "saving": return "Saving…";
		case "session": return state.message;
	}
}

export function usePreferenceState() {
	const [state, setState] = useState<PreferenceState>({ status: "loading", flags: emptyPreferences });
	const choices = useRef(new Map<PreferenceKey, SessionChoice>());
	const revision = useRef(0);
	const writes = useRef(0);

	function reconcile(result: Result<Preferences>) {
		if (!result.ok) {
			setState(current => ({ status: "session", flags: current.flags, message: result.message }));
			return;
		}
		const flags = { ...result.value };
		for (const [key, choice] of choices.current) flags[key] = choice.enabled;
		if (writes.current > 0) setState({ status: "saving", flags });
		else if (choices.current.size > 0) setState({ status: "session", flags, message: "Could not save every change. Unsaved choices apply only while this page is open." });
		else setState({ status: "saved", flags });
	}

	useEffect(() => {
		let active = true;
		let unsubscribe = () => {};
		initializePreferences().then(result => {
			if (!active) return;
			reconcile(result);
			if (result.ok) unsubscribe = watchPreferences(result => {
				if (active && writes.current === 0) reconcile(result);
			});
		});
		return () => { active = false; unsubscribe(); };
	}, []);

	async function setFlag(id: PreferenceKey, enabled: boolean) {
		const version = ++revision.current;
		choices.current.set(id, { enabled, revision: version });
		writes.current++;
		setState(current => ({ status: "saving", flags: { ...current.flags, [id]: enabled } }));
		const result = await writePreference(id, enabled);
		writes.current--;
		if (result.ok && choices.current.get(id)?.revision === version) choices.current.delete(id);
		if (writes.current === 0) {
			const readVersion = revision.current;
			const persisted = await readPreferences();
			if (readVersion === revision.current) reconcile(persisted);
		}
	}

	function resetSession() {
		revision.current++;
		choices.current.clear();
		setState({ status: "saved", flags: emptyPreferences });
	}

	return { flags: state.flags, ready: state.status !== "loading", setFlag, saveStatus: statusMessage(state), resetSession };
}
