import { useEffect } from "react";
import { usePreferences } from "@/data/usePreferences";
import { playSound, prepareSound } from "@/audio/sounds";

export function useInteractionSounds() {
	const { flags, ready } = usePreferences();
	useEffect(() => {
		if (!ready || flags.sounds !== true) return;
		function onClick(event: MouseEvent) {
			if (!event.isTrusted || !(event.target instanceof Element)) return;
			const control = event.target.closest<HTMLElement>('button, a[href], input[type="checkbox"], input[type="radio"], [role="switch"], [role="button"]');
			if (control === null || control.matches(':disabled, [aria-disabled="true"], [data-sound="none"], [data-sound="preference"]')) return;
			prepareSound();
			if (control.matches('a[href]')) playSound("navigate");
			else if (control.matches('[aria-pressed], [role="switch"], input')) playSound("select");
			else playSound("tap");
		}
		document.addEventListener("click", onClick, true);
		return () => document.removeEventListener("click", onClick, true);
	}, [flags.sounds, ready]);
}
