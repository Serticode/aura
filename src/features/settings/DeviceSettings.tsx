import { useEffect, useRef } from "react";
import { useDeviceSettings } from "@/features/settings/useDeviceSettings";

export function DeviceSettings() {
	const device = useDeviceSettings();
	const dialog = useRef<HTMLDialogElement>(null);
	const clearButton = useRef<HTMLButtonElement>(null);
	const confirming =
		device.clearState === "confirming" || device.clearState === "clearing";
	useEffect(() => {
		if (!confirming) return;
		const element = dialog.current!;
		const trigger = clearButton.current;
		element.showModal();
		return () => {
			element.close();
			trigger?.focus();
		};
	}, [confirming]);

	return (
		<div className="grid items-start gap-4">
			<div className="space-y-6">
				<div>
					<h4 className="text-sm font-semibold text-charcoal">
						What stays here
					</h4>
					<p className="mt-3 text-sm leading-relaxed text-earth">
						Mirror writing stays in memory while you write. A successful release
						or discard clears the draft. Quiet release keeps writing on your device.
						Gentle words responses are created automatically using Aura’s writing profile. They are not personally sent by a partner. Release sends your
						writing and feelings through Aura’s server to its response provider. Aura does
						not save this content or log request bodies. Provider retention
						has not been verified for this preview.
					</p>
					<p className="mt-3 text-sm leading-relaxed text-earth">
						Saving words keeps the response text on this device. Your
						preferences and saved words stay in this browser on this device.
						Your original writing is never saved as a draft or conversation history. Saved responses can include details from your writing.
					</p>
					<p className="mt-3 text-sm leading-relaxed text-earth">
						Responses can contain mistakes and do not replace professional care. Gentle words is
						Mirror’s default. Quiet release is an optional choice for each
						expression. Other support choices are saved for future features.
					</p>
				</div>
				<p role="status" className="pt-2 text-xs leading-relaxed text-earth">
					{device.saveStatus}
				</p>
				<div className="pt-2">
					<h4 className="text-sm font-semibold text-charcoal">
						Clear data on this device
					</h4>
					<p className="mt-2 text-sm leading-relaxed text-earth">
						Remove saved words and reset all preferences, including appearance.
						This cannot be undone.
					</p>
					<button
						ref={clearButton}
						type="button"
						disabled={!device.ready || device.clearState === "clearing"}
						onClick={() => device.setClearState("confirming")}
						className="text-link mt-4 min-h-11 rounded-sm text-sm [--link-accent:var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger"
					>
						Clear device data
					</button>
					<p role="status" className="mt-2 text-sm text-earth">
						{device.clearState === "complete" &&
							"Saved words removed. Your preferences are reset."}
						{device.clearState === "device-cleared" &&
							"Saved words removed and preferences reset. Older browser preferences could not be removed."}
						{device.clearState === "legacy-cleared" &&
							"Could not finish clearing device data. Older browser preferences were removed, but saved words and device preferences remain. Please try again."}
						{device.clearState === "error" &&
							"Could not finish clearing device data. Try again; your browser may have storage disabled."}
					</p>
				</div>
			</div>
			<dialog
				ref={dialog}
				aria-labelledby="clear-title"
				aria-describedby="clear-description"
				onCancel={(event) => {
					event.preventDefault();
					if (device.clearState !== "clearing") device.setClearState("idle");
				}}
				className="m-auto w-[min(28rem,90vw)] rounded-3xl border border-mulberry/15 bg-ivory p-8 text-charcoal shadow-xl backdrop:bg-mulberry/25"
			>
				<h2 id="clear-title" className="text-xl font-semibold text-heading">
					Clear your device data?
				</h2>
				<p
					id="clear-description"
					className="mt-3 text-sm leading-relaxed text-earth"
				>
					Your saved words will be removed. All preferences, including
					appearance, will reset. You can’t undo this.
				</p>
				<div className="mt-8 flex flex-wrap justify-end gap-4">
					<button
						autoFocus
						type="button"
						disabled={device.clearState === "clearing"}
						onClick={() => device.setClearState("idle")}
						className="min-h-11 rounded-full bg-mulberry px-6 py-3 text-ivory focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
					>
						Keep my data
					</button>
					<button
						type="button"
						disabled={device.clearState === "clearing"}
						onClick={() => {
							void device.clear();
						}}
						className="text-link min-h-11 rounded-sm px-2 py-3 [--link-accent:var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger"
					>
						{device.clearState === "clearing" ? "Clearing…" : "Clear data"}
					</button>
				</div>
			</dialog>
		</div>
	);
}
