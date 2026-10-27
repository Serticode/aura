import { useState } from "react";
import { clearLocalData } from "@/data/localStore";
import { usePreferences } from "@/data/usePreferences";

type ClearState = "idle" | "confirming" | "clearing" | "complete" | "device-cleared" | "legacy-cleared" | "error";

export function useDeviceSettings() {
	const preferences = usePreferences();
	const [clearState, setClearState] = useState<ClearState>("idle");
	async function clear() {
		setClearState("clearing");
		const result = await clearLocalData();
		if (result.status === "complete" || result.status === "device-cleared") preferences.resetSession();
		setClearState(result.status);
	}
	return { ...preferences, clearState, setClearState, clear };
}
