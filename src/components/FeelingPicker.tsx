import { moods, type Mood } from "@/app/moods";
import { ClearSelectionButton } from "@/components/ClearSelectionButton";

interface FeelingPickerProps {
	readonly selected: readonly Mood[];
	readonly label: string;
	readonly align: "start" | "center";
	readonly onToggle: (mood: Mood) => void;
	readonly onClear: () => void;
}

export function FeelingPicker({
	selected,
	label,
	align,
	onToggle,
	onClear,
}: FeelingPickerProps) {
	return (
		<div
			role="group"
			aria-label={label}
			className={[
				"flex flex-wrap items-center gap-2 md:gap-3",
				align === "center" ? "justify-center" : "justify-start",
			].join(" ")}
		>
			{moods.map((mood) => (
				<button
					key={mood}
					type="button"
					aria-pressed={selected.includes(mood)}
					onClick={() => onToggle(mood)}
					className={[
						"min-h-11 rounded-full border px-4 py-2 text-sm transition-colors active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose",
						selected.includes(mood)
							? "border-mulberry bg-mulberry text-ivory"
							: "border-surface-muted/30 bg-clear-surface text-surface-ink hover:border-surface-ink",
					].join(" ")}
				>
					{mood}
				</button>
			))}
			<ClearSelectionButton
				disabled={selected.length === 0}
				onClear={onClear}
			/>
		</div>
	);
}
