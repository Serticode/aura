import { useEffect, useRef } from "react";
import { usePreferences } from "@/data/usePreferences";
import { playSound, prepareSound } from "@/audio/sounds";

export function useNoticeSound() {
	const { flags } = usePreferences();
	const enabled = useRef(flags.notificationSounds !== false);
	useEffect(() => { enabled.current = flags.notificationSounds !== false; }, [flags.notificationSounds]);
	function prepare() {
		if (enabled.current) prepareSound();
	}
	function play() {
		if (enabled.current) playSound("notice");
	}
	return { prepare, play };
}
