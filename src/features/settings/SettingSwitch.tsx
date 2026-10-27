import { useId } from "react";

interface SettingSwitchProps {
	readonly label: string;
	readonly description: string;
	readonly enabled: boolean;
	readonly disabled: boolean;
	readonly onToggle: () => void;
}

export function SettingSwitch({
	label,
	description,
	enabled,
	disabled,
	onToggle,
}: SettingSwitchProps) {
	const descriptionId = useId();
	return (
		<div className="flex items-center justify-between gap-5 py-4">
			<div>
				<p className="text-sm font-medium text-charcoal">{label}</p>
				<p
					id={descriptionId}
					className="mt-1 text-xs leading-relaxed text-earth"
				>
					{description}
				</p>
			</div>
			<button
				type="button"
				role="switch"
				data-sound={label === "Interaction sounds" || label === "Notification sounds" ? "preference" : "select"}
				aria-label={label}
				aria-describedby={descriptionId}
				aria-checked={enabled}
				disabled={disabled}
				onClick={onToggle}
				className={[
					"flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose disabled:opacity-50",
					enabled ? "bg-mulberry" : "bg-earth/25",
				].join(" ")}
			>
				<span
					className={[
						"h-6 w-6 rounded-full bg-white transition-transform duration-200",
						enabled ? "translate-x-6" : "translate-x-0",
					].join(" ")}
				/>
			</button>
		</div>
	);
}
