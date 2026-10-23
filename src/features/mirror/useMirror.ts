import { useEffect, useRef, useState } from "react";
import { liveQuery } from "dexie";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import type { Mood } from "@/app/moods";
import { useNoticeSound } from "@/features/mirror/useNoticeSound";
import { requestReflection } from "@/features/mirror/requestReflection";
import { usePreferences } from "@/data/usePreferences";
import { localStore } from "@/data/localStore";
import { responses } from "@/features/mirror/responses";

interface Words {
	readonly id: string;
	readonly text: string;
}

type Stage = "writing" | "thinking" | "releasing" | "response" | "saved";

export function useMirror(initialMoods: readonly Mood[]) {
	const { flags, ready } = usePreferences();
	const [draft, setDraft] = useState("");
	const [selectedMoods, setSelectedMoods] =
		useState<readonly Mood[]>(initialMoods);
	const [quietOverride, setQuietOverride] = useState(false);
	const quiet = quietOverride;
	const sound = useNoticeSound();
	const pending = useRef<AbortController | null>(null);
	useEffect(() => () => pending.current?.abort(), []);
	const [stage, setStage] = useState<Stage>("writing");
	const [response, setResponse] = useState<Words & { readonly source: "ai" | "quiet" }>({ ...responses[3], source: "quiet" });
	const [savedReturnStage, setSavedReturnStage] = useState<Stage>("writing");
	const [savingId, setSavingId] = useState<string | null>(null);
	const saving = useRef(false);
	const [notice, setNotice] = useState<string | null>(null);
	const [savedWords, setSavedWords] = useState<readonly Words[]>([]);
	const savedIds = savedWords.map(({ id }) => id);
	const [systemReduced, setSystemReduced] = useState(
		() => matchMedia("(prefers-reduced-motion: reduce)").matches,
	);
	const reducedMotion = systemReduced || flags["reducedMotion"] === true;
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			draft.length > 0 && currentLocation.pathname !== nextLocation.pathname,
	);

	useBeforeUnload((event) => {
		if (draft.length > 0) {
			event.preventDefault();
			event.returnValue = "";
		}
	});
	useEffect(() => {
		const query = matchMedia("(prefers-reduced-motion: reduce)");
		const onChange = () => setSystemReduced(query.matches);
		query.addEventListener("change", onChange);
		return () => query.removeEventListener("change", onChange);
	}, []);
	useEffect(() => {
		let active = true;
		const subscription = liveQuery(() =>
			localStore.affirmations.toArray(),
		).subscribe({
			next: (rows) => {
				if (active) setSavedWords(rows.flatMap(({ id, text }) => {
					if (text !== undefined) return [{ id, text }];
					const legacy = responses.find((item) => item.id === id && item.id !== "quiet");
					return legacy === undefined ? [] : [legacy];
				}));
			},
			error: () => {
				if (active)
					setNotice(
						"Saved words are unavailable because device storage could not be opened.",
					);
			},
		});
		return () => {
			active = false;
			subscription.unsubscribe();
		};
	}, []);
	useEffect(() => {
		if (stage !== "releasing") return;
		const timer = window.setTimeout(
			() => setStage("response"),
			reducedMotion ? 0 : 500,
		);
		return () => window.clearTimeout(timer);
	}, [stage, reducedMotion]);

	useEffect(() => {
		const finishWhenHidden = () => {
			if (document.hidden && stage === "releasing") setStage("response");
		};
		document.addEventListener("visibilitychange", finishWhenHidden);
		return () =>
			document.removeEventListener("visibilitychange", finishWhenHidden);
	}, [stage]);

	function toggleMood(mood: Mood) {
		setSelectedMoods((current) =>
			current.includes(mood)
				? current.filter((item) => item !== mood)
				: [...current, mood],
		);
		setNotice(null);
	}
	const canRelease =
		ready && (draft.trim().length > 0 || selectedMoods.length > 0 || quiet);

	async function release() {
		if (stage !== "writing" || !canRelease) return;
		if (!quiet) {
			sound.prepare();
			if (pending.current !== null) return;
			const controller = new AbortController();
			pending.current = controller;
			setStage("thinking");
			setNotice(null);
			const result = await requestReflection(draft, selectedMoods, AbortSignal.any([controller.signal, AbortSignal.timeout(25000)]));
			pending.current = null;
			if (controller.signal.aborted) return;
			if (!result.ok) {
				setNotice(result.message);
				sound.play();
				setStage("writing");
				return;
			}
			setResponse({ id: crypto.randomUUID(), text: result.text, source: "ai" });
			setDraft("");
			setStage("response");
			return;
		}
		setResponse({ ...responses[3], source: "quiet" });
		setDraft("");
		setNotice(null);
		setStage(reducedMotion ? "response" : "releasing");
	}
	function expressAgain() {
		setDraft("");
		setSelectedMoods([]);
		setQuietOverride(false);
		setResponse({ ...responses[3], source: "quiet" });
		setStage("writing");
		setNotice(null);
	}
	function toggleSavedView() {
		setNotice(null);
		if (stage === "saved") setStage(savedReturnStage);
		else {
			setSavedReturnStage(stage);
			setStage("saved");
		}
	}
	async function toggleSaved(id: string) {
		if (saving.current) return;
		saving.current = true;
		setSavingId(id);
		try {
			const saved = savedIds.includes(id);
			if (saved) await localStore.affirmations.delete(id);
			else await localStore.affirmations.put({ id, text: response.text });
			setNotice(
				saved ? "Removed from your saved words." : "Saved on this device.",
			);
		} catch {
			setNotice(
				"Could not update saved words. Your browser may have device storage disabled.",
			);
		} finally {
			saving.current = false;
			setSavingId(null);
		}
	}

	return {
		draft,
		setDraft,
		selectedMoods,
		setSelectedMoods,
		toggleMood,
		quiet,
		savedWords,
		setQuietOverride,
		stage,
		response,
		notice,
		setNotice,
		toggleSavedView,
		savingId,
		release,
		canRelease,
		expressAgain,
		savedIds,
		toggleSaved,
		blocker,
		ready,
		reducedMotion,
	};
}
