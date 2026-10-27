import { useEffect, useRef, useState } from "react";
import type { Words } from "@/domain/words";
import { updateSavedWord, watchSavedWords } from "@/data/savedWordsStore";

export function useSavedWords() {
	const [words, setWords] = useState<readonly Words[]>([]);
	const [notice, setNotice] = useState<string | null>(null);
	const [savingId, setSavingId] = useState<string | null>(null);
	const saving = useRef(false);
	useEffect(() => watchSavedWords(result => {
		if (result.ok) setWords(result.value);
		else setNotice(result.message);
	}), []);

	async function toggle(word: Words) {
		if (saving.current) return;
		saving.current = true;
		setSavingId(word.id);
		const saved = words.some(item => item.id === word.id);
		const result = await updateSavedWord(word, saved);
		setNotice(result.ok ? (saved ? "Removed from your saved words." : "Saved on this device.") : result.message);
		saving.current = false;
		setSavingId(null);
	}

	return { words, notice, setNotice, savingId, toggle };
}
