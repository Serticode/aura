import type { useAppUpdate } from "@/app/useAppUpdate";

interface AppUpdateProps {
	readonly session: ReturnType<typeof useAppUpdate>;
	readonly inSettings: boolean;
	readonly onOpenSettings: () => void;
}

export function AppUpdate({
	session,
	inSettings,
	onOpenSettings,
}: AppUpdateProps) {
	const { state, update } = session;
	if (state === "current") return null;
	return (
		<aside
			aria-label="App update"
			className={[
				inSettings
					? "mx-6 mb-6"
					: "fixed inset-x-4 top-20 z-20 mx-auto max-w-xl",
				"flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mulberry/15 bg-ivory px-5 py-4 shadow-sm",
			].join(" ")}
		>
			<p role="status" className="text-sm text-charcoal">
				{state === "error"
					? "Offline setup or update failed. Reload when you’re finished writing to try again."
					: "A new version of Aura is ready."}
			</p>
			{state !== "error" &&
				(inSettings ? (
					<button
						type="button"
						disabled={state === "updating"}
						onClick={() => {
							void update();
						}}
						className="min-h-11 rounded-full bg-mulberry px-5 py-2 text-sm text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
					>
						{state === "updating" ? "Updating…" : "Update Aura"}
					</button>
				) : (
					<button
						type="button"
						onClick={onOpenSettings}
						className="text-link min-h-11 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
					>
						Update in Settings
					</button>
				))}
		</aside>
	);
}
