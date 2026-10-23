interface ClearSelectionButtonProps {
	readonly disabled: boolean;
	readonly onClear: () => void;
}

export function ClearSelectionButton({
	disabled,
	onClear,
}: ClearSelectionButtonProps) {
	return (
		<button
			type="button"
			aria-label="Clear selected feelings"
			title="Clear selected feelings"
			disabled={disabled}
			onClick={onClear}
			className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-danger-border bg-clear-surface text-danger-border transition-colors active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger disabled:border-earth/10 disabled:bg-earth/5 disabled:text-earth/40"
		>
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="h-5 w-5"
			>
				<path d="m16 3 5 5a2 2 0 0 1 0 3L11 21H7l-4-4a2 2 0 0 1 0-3L13 3a2 2 0 0 1 3 0ZM8 9l7 7M11 21h10" />
			</svg>
		</button>
	);
}
