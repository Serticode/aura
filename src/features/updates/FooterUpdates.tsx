import { useEffect, useRef, useState } from "react";
import { liveQuery } from "dexie";
import { localStore } from "@/data/localStore";
import {
	latestReleaseId,
	releases,
	updateIcons,
} from "@/features/updates/releases";

export function FooterUpdates() {
	const panel = useRef<HTMLDialogElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const [phase, setPhase] = useState<"closed" | "open" | "closing">("closed");
	const [lastSeen, setLastSeen] = useState<string | null>(null);
	const [ready, setReady] = useState(false);
	const [storageNotice, setStorageNotice] = useState("");
	const unread = ready && lastSeen !== latestReleaseId;

	useEffect(() => {
		let active = true;
		let unsubscribe = () => {};
		localStore.updates.get("lastSeen").then(
			(row) => {
				if (!active) return;
				setLastSeen(row?.releaseId ?? null);
				setReady(true);
				const subscription = liveQuery(() =>
					localStore.updates.get("lastSeen"),
				).subscribe({
					next: (current) => {
						setLastSeen(current?.releaseId ?? null);
					},
					error: () =>
						setStorageNotice(
							"Your read status can’t be saved on this device right now.",
						),
				});
				unsubscribe = () => subscription.unsubscribe();
			},
			() => {
				if (!active) return;
				setReady(true);
				setStorageNotice(
					"Your read status can’t be saved on this device right now.",
				);
			},
		);
		return () => {
			active = false;
			unsubscribe();
		};
	}, []);

	async function openUpdates() {
		panel.current!.showModal();
		setPhase("open");
		setLastSeen(latestReleaseId);
		try {
			await localStore.updates.put({
				id: "lastSeen",
				releaseId: latestReleaseId,
			});
		} catch {
			setStorageNotice(
				"Your read status can’t be saved on this device right now.",
			);
		}
	}

	function closeUpdates() {
		setPhase("closing");
	}

	return (
		<>
			<button
				ref={trigger}
				type="button"
				aria-label={unread ? "What’s new — unread updates" : "What’s new"}
				aria-haspopup="dialog"
				aria-expanded={phase !== "closed"}
				aria-controls="aura-updates"
				title="What’s new"
				disabled={!ready}
				onClick={() => {
					void openUpdates();
				}}
				className="relative grid size-11 shrink-0 place-items-center rounded-full text-earth transition-colors hover:bg-petal/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose active:scale-95"
			>
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.6"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="size-4"
				>
					<rect x="5" y="3" width="14" height="18" rx="3" />
					<path d="M9 8h6M9 12h6M9 16h3" />
				</svg>
				{unread && (
					<span
						data-testid="updates-unread"
						aria-hidden="true"
						className="absolute right-2 top-2 size-1.5 rounded-full bg-rose"
					/>
				)}
			</button>
			<dialog
				ref={panel}
				id="aura-updates"
				aria-labelledby="updates-title"
				aria-describedby="updates-description"
				data-closing={phase === "closing"}
				className="updates-material fixed inset-auto bottom-16 left-4 m-0 w-[26rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-3xl border border-mulberry/15 p-0 text-charcoal"
				onCancel={(event) => {
					event.preventDefault();
					closeUpdates();
				}}
				onClose={() => {
					setPhase("closed");
					trigger.current!.focus();
				}}
				onClick={(event) => {
					if (event.target !== event.currentTarget) return;
					const rect = event.currentTarget.getBoundingClientRect();
					if (
						event.clientX < rect.left ||
						event.clientX > rect.right ||
						event.clientY < rect.top ||
						event.clientY > rect.bottom
					)
						closeUpdates();
				}}
				onAnimationEnd={(event) => {
					if (event.target === event.currentTarget && phase === "closing")
						panel.current!.close();
				}}
			>
				<header className="relative px-6 pb-4 pt-6">
					<div aria-hidden="true" className="mb-5 flex gap-1.5">
						{["sun", "rose", "lilac", "sky", "mint"].map((tone) => (
							<span
								key={tone}
								data-update-tone={tone}
								className="size-2 rounded-full"
							/>
						))}
					</div>
					<button
						type="button"
						aria-label="Close updates"
						onClick={closeUpdates}
						className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-earth hover:bg-petal/30 focus-visible:outline-2 focus-visible:outline-rose"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
							className="size-4"
						>
							<path d="m6 6 12 12M18 6 6 18" />
						</svg>
					</button>
					<h2
						id="updates-title"
						className="font-display text-2xl tracking-tight text-heading"
					>
						What’s new
					</h2>
					<p id="updates-description" className="mt-1 text-sm text-earth">
						Little things to make this space feel more yours.
					</p>
				</header>
				<div
					tabIndex={0}
					role="region"
					aria-label="Release notes"
					className="updates-scroll min-h-0 overflow-y-auto overscroll-contain px-6 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rose"
				>
					{releases.map((release) => (
						<section
							key={release.id}
							aria-label={release.date}
							className="border-t border-mulberry/10 py-5 first:border-0 first:pt-1"
						>
							<h3 className="mb-5 font-mono text-[11px] uppercase tracking-widest text-earth">
								{release.date}
							</h3>
							<ul className="space-y-5">
								{release.notes.map((note) => (
									<li key={note.title} className="flex items-start gap-3.5">
										<span
											data-update-tone={note.tone}
											className="update-tile grid size-10 shrink-0 place-items-center rounded-xl"
										>
											<svg
												aria-hidden="true"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="1.6"
												strokeLinecap="round"
												strokeLinejoin="round"
												className="size-5"
											>
												<path d={updateIcons[note.icon]} />
											</svg>
										</span>
										<div>
											<h4 className="text-sm font-semibold leading-5">
												{note.title}
											</h4>
											<p className="mt-1 text-[13px] leading-relaxed text-earth">
												{note.description}
											</p>
										</div>
									</li>
								))}
							</ul>
						</section>
					))}
				</div>
				<div className="px-6 pb-5 pt-4">
					{storageNotice !== "" && (
						<p
							role="status"
							className="mb-3 text-xs leading-relaxed text-earth"
						>
							{storageNotice}
						</p>
					)}
					<button
						type="button"
						onClick={closeUpdates}
						className="updates-confirm min-h-11 w-full rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose active:scale-[0.99]"
					>
						Got it
					</button>
				</div>
			</dialog>
		</>
	);
}
