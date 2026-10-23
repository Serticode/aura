import { createContext } from "react";
import type { usePreferenceState } from "@/data/usePreferenceState";

export const PreferencesContext = createContext<ReturnType<
	typeof usePreferenceState
> | null>(null);
