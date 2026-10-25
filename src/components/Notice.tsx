interface NoticeProps {
	readonly message: string;
	readonly onDismiss: () => void;
}

export function Notice({ message, onDismiss }: NoticeProps) {
	return (
		<aside
			role="status"
			aria-live="polite"
			aria-atomic="true"
			className="slide-notice fixed bottom-28 right-4 z-30 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-[2rem] border border-mulberry/15 bg-clear-surface py-3 pl-4 pr-2 text-surface-ink lg:bottom-8 lg:right-6"
		>
			<span aria-hidden="true" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-hover text-surface-active">!</span>
			<p className="flex-1 text-sm leading-relaxed">{message}</p>
			<button type="button" aria-label="Dismiss notification" onClick={onDismiss} className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-surface-muted hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-rose">
				<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4"><path d="m6 6 12 12M18 6 6 18" /></svg>
			</button>
		</aside>
	);
}
