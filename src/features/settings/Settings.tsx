import { DeviceSettings } from '@/features/settings/DeviceSettings';
import { supportPreferences, useSupportPreferences } from "@/features/settings/useSupportPreferences";
import { usePlatformSounds } from "@/features/settings/usePlatformSounds";

export function Settings() {
	const { chosen, togglePreference, saveStatus, ready } = useSupportPreferences();
	const { enabled, toggleSounds, saveError } = usePlatformSounds();

	return (
		<section className="animate-rise mx-auto w-full max-w-6xl px-8 pt-24 pb-36 md:px-12 lg:px-16">
			<header className="mb-10 border-b border-mulberry/10 pb-7">
				<h1 className="text-3xl font-semibold tracking-tight text-mulberry">Settings</h1>
				<p className="mt-2 text-base text-earth">Make this space feel like yours.</p>
			</header>

			<div className="grid items-start gap-6 lg:grid-cols-[13rem_1fr] lg:gap-12">
				<div>
					<h2 className="text-base font-semibold text-charcoal">Your support</h2>
					<p className="mt-2 text-sm leading-relaxed text-earth">
						Quiet expression sets Mirror’s default. Other choices save your interest in future support; they don’t change this pilot.
					</p>
				</div>
				<div>
					<div
						role="group"
						aria-label="Support preferences"
						className="overflow-hidden rounded-2xl border border-mulberry/10 bg-white/50">
						{supportPreferences.map((preference) => {
							const selected = chosen.includes(preference.id);
							return (
								<button
									key={preference.id}
									type="button"
									disabled={!ready}
									aria-pressed={selected}
									onClick={() => togglePreference(preference.id)}
									className={[
										"flex w-full items-center gap-5 border-b border-mulberry/10 px-6 py-4 text-left transition-colors duration-200 last:border-b-0 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-rose",
										selected ? "bg-petal/25" : "hover:bg-petal/10",
									].join(" ")}>
									<span className="flex-1">
										<span className="block text-base font-semibold text-charcoal">
											{preference.title}
										</span>
										<span className="mt-1 block text-sm leading-relaxed text-earth">
											{preference.description}
										</span>
									</span>
									<span
										aria-hidden="true"
										className={[
											"flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-sm",
											selected
												? "border-mulberry bg-mulberry text-ivory"
												: "border-mulberry/25 bg-ivory/50",
										].join(" ")}>
										{selected ? "✓" : ""}
									</span>
								</button>
							);
						})}
					</div>
					<p role="status" className="mt-3 text-xs leading-relaxed text-earth">
						{saveStatus}
					</p>
				</div>
			</div>

			<div className="mt-10 grid items-start gap-6 border-t border-mulberry/10 pt-8 lg:grid-cols-[13rem_1fr] lg:gap-12">
				<div>
					<h2 className="text-base font-semibold text-charcoal">Sound</h2>
					<p className="mt-2 text-sm leading-relaxed text-earth">Keep things quiet, or add a little sound.</p>
				</div>
				<div>
					<div className="flex items-center gap-6 rounded-2xl border border-mulberry/10 bg-white/50 px-6 py-5">
						<div className="flex-1">
							<h3 id="platform-sounds-label" className="text-base font-semibold text-charcoal">
								Platform sounds
							</h3>
							<p id="platform-sounds-description" className="mt-1 text-sm leading-relaxed text-earth">
								Sound playback is unavailable in this pilot. Your saved preference is kept for a future version.
							</p>
						</div>
						<button
							type="button"
							role="switch"
							disabled
							aria-checked={enabled}
							aria-labelledby="platform-sounds-label"
							aria-describedby="platform-sounds-description"
							onClick={toggleSounds}
							className={[
								"flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose",
								enabled ? "bg-mulberry" : "bg-earth/25",
							].join(" ")}>
							<span
								className={[
									"h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-ambient",
									enabled ? "translate-x-6" : "translate-x-0",
								].join(" ")}
							/>
						</button>
					</div>
					{saveError !== null && (
						<p role="status" className="mt-3 text-xs text-earth">
							{saveError}
						</p>
					)}
				</div>
			</div>
			<DeviceSettings />
		</section>
	);
}
