import { useEffect, useRef } from "react";

interface DiscardDialogProps {
	readonly onStay: () => void;
	readonly onDiscard: () => void;
}

export function DiscardDialog({ onStay, onDiscard }: DiscardDialogProps) {
	const dialog = useRef<HTMLDialogElement>(null);
	useEffect(() => {
		const element = dialog.current!;
		element.showModal();
		return () => element.close();
	}, []);
	function stay() {
		dialog.current!.close();
		onStay();
	}
	function discard() {
		dialog.current!.close();
		onDiscard();
	}
	return (
		<dialog
			ref={dialog}
			aria-labelledby="discard-title"
			onCancel={(event) => {
				event.preventDefault();
				stay();
			}}
			className="m-auto w-[min(28rem,90vw)] rounded-3xl border border-mulberry/15 bg-ivory p-8 text-charcoal shadow-xl backdrop:bg-mulberry/25"
		>
			<h2 id="discard-title" className="text-xl font-semibold text-mulberry">
				Leave this writing behind?
			</h2>
			<p className="mt-3 text-base leading-relaxed text-earth">
				Your unfinished words aren’t saved. Stay to keep writing, or discard
				them and leave.
			</p>
			<div className="mt-8 flex flex-wrap justify-end gap-4">
				<button
					autoFocus
					type="button"
					onClick={stay}
					className="rounded-full bg-mulberry px-6 py-3 text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
				>
					Stay
				</button>
				<button
					type="button"
					onClick={discard}
					className="text-link px-2 py-3 [--link-accent:var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger"
				>
					Discard and leave
				</button>
			</div>
		</dialog>
	);
}
