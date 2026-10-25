import { useEffect, useRef } from "react";
import { usePreferences } from "@/data/usePreferences";

export function useNoticeSound() {
	const { flags } = usePreferences();
	const context = useRef<AudioContext | null>(null);
	const enabled = flags.notificationSounds !== false;
	useEffect(() => () => { void context.current?.close(); }, []);

	function prepare() {
		if (!enabled) return;
		try {
			context.current ??= new AudioContext();
			void context.current.resume().catch(() => {
				// Visual feedback remains available when the browser blocks sound.
			});
		} catch {
			// Devices without audio still receive the visual notice.
		}
	}

	function play() {
		const audio = context.current;
		if (!enabled || audio === null || audio.state !== "running") return;
		const tone = audio.createOscillator();
		const volume = audio.createGain();
		const start = audio.currentTime;
		tone.type = "sine";
		tone.frequency.setValueAtTime(520, start);
		tone.frequency.exponentialRampToValueAtTime(390, start + 0.16);
		volume.gain.setValueAtTime(0, start);
		volume.gain.linearRampToValueAtTime(0.07, start + 0.015);
		volume.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
		tone.connect(volume);
		volume.connect(audio.destination);
		tone.start(start);
		tone.stop(start + 0.24);
		tone.onended = () => { tone.disconnect(); volume.disconnect(); };
	}

	return { prepare, play };
}
