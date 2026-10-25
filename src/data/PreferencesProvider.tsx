import type { ReactNode } from "react";
import { PreferencesContext } from "@/data/preferencesContext";
import { usePreferenceState } from "@/data/usePreferenceState";

interface PreferencesProviderProps {
	readonly children: ReactNode;
}

export function PreferencesProvider({ children }: PreferencesProviderProps) {
	const preferences = usePreferenceState();
	return (
		<PreferencesContext value={preferences}>{children}</PreferencesContext>
	);
}
