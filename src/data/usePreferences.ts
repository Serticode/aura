import { PreferencesContext } from "@/data/preferencesContext";
import { useContext } from "react";

export function usePreferences() {
	// The application root provides the single device preference session.
	return useContext(PreferencesContext)!;
}
