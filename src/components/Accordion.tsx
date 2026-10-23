import { useId, useState, type ReactNode } from "react";

interface AccordionProps {
	readonly title: string;
	readonly children: ReactNode;
}

// Web adaptation of DievasAccordion's grouped, shadow free pattern.
export function Accordion({ title, children }: AccordionProps) {
	const [expanded, setExpanded] = useState(false);
	const id = useId();
	return (
		<section className="dievas-accordion">
			<h3>
				<button
					type="button"
					aria-expanded={expanded}
					aria-controls={id}
					onClick={() => setExpanded(!expanded)}
					className="flex min-h-12 w-full items-center justify-between gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
				>
					{title}
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.6"
						className={[
							"h-5 w-5 shrink-0 transition-transform duration-200",
							expanded ? "rotate-180" : "",
						].join(" ")}
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</button>
			</h3>
			<div
				id={id}
				className="accordion-content"
				data-expanded={expanded}
				inert={!expanded}
			>
				<div className="min-h-0 overflow-hidden">
					<div className="mx-4 border-t border-mulberry/10 py-4">
						{children}
					</div>
				</div>
			</div>
		</section>
	);
}
