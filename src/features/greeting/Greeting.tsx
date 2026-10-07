import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Endearment } from "@/components/Endearment";
import { Orb } from "@/components/Orb";
import { moods, type Mood } from "@/app/moods";

export function Greeting() {
	const navigate = useNavigate();
	const [selectedMoods, setSelectedMoods] = useState<readonly Mood[]>([]);

	return (
		<section className="mx-auto flex w-full max-w-[100rem] flex-1 flex-col justify-center gap-16 px-8 pt-28 pb-24 md:px-14 lg:gap-20 lg:px-24 xl:px-32">
			<div className="flex flex-col items-center text-center">
				<div className="animate-rise flex h-48 items-center justify-center lg:h-56">
					<div className="scale-125 lg:scale-150">
						<Orb />
					</div>
				</div>
				<div className="animate-rise mt-8 w-full [animation-delay:90ms]">
					<p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-earth">
						A little space for you
					</p>
					<h1 className="font-display text-[clamp(2rem,3.3vw,3.5rem)] font-medium leading-[1.15] tracking-[-0.035em] text-mulberry">
						<Endearment prefix="How does today feel; " suffix="?" />
					</h1>
					<p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-charcoal/75">
						Come as you are. There is no right way to feel, and no need to find all the words.
					</p>
				</div>
			</div>

			<div className="animate-rise border-t border-mulberry/15 pt-8 [animation-delay:150ms]">
				<div className="grid gap-10 xl:grid-cols-[1.4fr_1fr] xl:gap-20">
					<div>
						<h2 className="text-base font-semibold text-charcoal">Find a feeling that fits</h2>
						<div className="mt-1 flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
							<p className="text-sm text-earth">Choose anyone, or leave it open.</p>
							<button
								type="button"
								disabled={selectedMoods.length === 0}
								onClick={() => setSelectedMoods([])}
								className="text-link rounded-sm text-sm [--link-accent:var(--color-danger)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-danger disabled:invisible">
								Clear selection
							</button>
						</div>
						<div role="group" aria-label="Choose a mood" className="mt-5 flex flex-wrap gap-2.5">
							{moods.map((option) => {
								const selected = selectedMoods.includes(option);
								return (
									<button
										key={option}
										type="button"
										aria-pressed={selected}
										onClick={() => setSelectedMoods((current) =>
										current.includes(option) ? current.filter((mood) => mood !== option) : [...current, option],
									)}
										className={[
											"min-h-11 rounded-full border px-5 py-2.5 text-sm transition-colors duration-200 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose",
											selected
												? "border-mulberry bg-mulberry text-ivory"
												: "border-mulberry/20 bg-transparent text-charcoal/80 hover:border-rose hover:bg-petal/20",
										].join(" ")}>
										{option}
									</button>
								);
							})}
						</div>
					</div>
					<div className="xl:border-l xl:border-mulberry/10 xl:pl-12">
						<label htmlFor="weight" className="text-base font-semibold text-charcoal">
							How much are you carrying?
						</label>
						<p className="mt-1 text-sm text-earth">A little, a lot, or somewhere in between?</p>
						<input
							id="weight"
							type="range"
							min={0}
							max={100}
							defaultValue={50}
							aria-label="How heavy does today feel?"
							className="mt-6 h-6 w-full cursor-pointer accent-rose focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose"
						/>
						<div className="mt-1 flex justify-between text-xs text-earth">
							<span>Gentle</span>
							<span>Heavy</span>
						</div>
					</div>
				</div>
				<div className="mt-10 flex flex-wrap items-center justify-between gap-6">
					<Link
						to="/boundaries"
						className="text-link py-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose">
						Skip for now
					</Link>
					<button
						type="button"
						onClick={() => navigate("/boundaries")}
						className="btn-wave flex min-h-12 items-center justify-between gap-12 rounded-full bg-mulberry px-8 py-3.5 text-base font-semibold text-ivory transition-transform duration-150 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose">
						Continue <span aria-hidden="true">→</span>
					</button>
				</div>
			</div>
		</section>
	);
}
