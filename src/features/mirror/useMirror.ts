import { useEffect, useRef, useState } from "react";
import { useBeforeUnload, useBlocker } from "react-router-dom";
import type { Mood } from "@/domain/moods";
import { playSound, prepareSound } from "@/audio/sounds";
import { useNoticeSound } from "@/features/mirror/useNoticeSound";
import { requestReflection } from "@/features/mirror/requestReflection";
import { usePreferences } from "@/data/usePreferences";
import { useSavedWords } from "@/features/mirror/useSavedWords";
import type { MirrorState, Reflection } from "@/features/mirror/mirrorState";

export function useMirror(initialMoods: readonly Mood[]) {
	const { flags, ready } = usePreferences();
	const [draft, setDraft] = useState("");
	const [selectedMoods, setSelectedMoods] =
		useState<readonly Mood[]>(initialMoods);
	const [quietOverride, setQuietOverride] = useState(false);
	const quiet = quietOverride;
	const sound = useNoticeSound();
	const [state, setState] = useState<MirrorState>({ stage: "writing" });
	const previousStage = useRef(state.stage);
	useEffect(() => {
		if (previousStage.current === "thinking" && state.stage === "response" && flags.sounds === true) playSound("complete");
		previousStage.current = state.stage;
	}, [state, flags.sounds]);
	const saved = useSavedWords();
	const { notice, setNotice } = saved;
	const savedIds = saved.words.map(({ id }) => id);
	useEffect(() => {
		if (state.stage !== "thinking") return;
		const controller = state.controller;
		return () => controller.abort();
	}, [state]);
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
		if (state.stage !== "releasing") return;
		const response = state.response;
		const finish = () => setState({ stage: "response", response });
		const timer = window.setTimeout(finish, reducedMotion ? 0 : 500);
		const finishWhenHidden = () => { if (document.hidden) finish(); };
		document.addEventListener("visibilitychange", finishWhenHidden);
		return () => {
			window.clearTimeout(timer);
			document.removeEventListener("visibilitychange", finishWhenHidden);
		};
	}, [state, reducedMotion]);

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
		if (state.stage !== "writing" || !canRelease) return;
		setNotice(null);
		if (quiet) {
			const response: Reflection = { id: "quiet", text: "Released.", source: "quiet" };
			setDraft("");
			setState({ stage: reducedMotion ? "response" : "releasing", response });
			return;
		}
		sound.prepare();
		if (flags.sounds === true) prepareSound();
		const controller = new AbortController();
		setState({ stage: "thinking", controller });
		const result = await requestReflection(draft, selectedMoods, AbortSignal.any([controller.signal, AbortSignal.timeout(25000)]));
		if (controller.signal.aborted) return;
		switch (result.ok) {
			case false:
				setNotice(result.message);
				sound.play();
				setState({ stage: "writing" });
				return;
			case true:
				setDraft("");
				setState({ stage: "response", response: { id: crypto.randomUUID(), text: result.text, source: "reflection" } });
		}
	}

	function toggleSavedView() {
		setNotice(null);
		setState(current => {
			switch (current.stage) {
				case "saved": return current.returnTo;
				case "writing":
				case "response": return { stage: "saved", returnTo: current };
				case "thinking":
				case "releasing": return current;
			}
		});
	}

	return {
		draft, setDraft, selectedMoods, setSelectedMoods, toggleMood,
		quiet, setQuietOverride, state, notice, setNotice, toggleSavedView,
		savedWords: saved.words, savingId: saved.savingId, toggleSaved: saved.toggle,
		release, canRelease, savedIds, blocker, ready, reducedMotion,
	};
}
