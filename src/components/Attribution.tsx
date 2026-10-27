import { FooterUpdates } from "@/features/updates/FooterUpdates";

function Heart({ className }: { className: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
			className={className}
		>
			<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
		</svg>
	);
}

export function Attribution() {
	return (
		<footer className="fixed inset-x-0 bottom-0 z-10 flex h-12 w-full items-center justify-between bg-ivory px-4 sm:px-6">
			<div className="flex items-center gap-1">
				<FooterUpdates />
				<a
					href="https://portfolio.serticode.com"
					target="_blank"
					rel="noopener noreferrer"
					className="group text-link inline-flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose [--link-from:color-mix(in_srgb,var(--color-charcoal)_60%,transparent)] [--link-to:var(--color-charcoal)]"
				>
					<Heart className="h-3 w-3 text-plum transition-transform duration-300 ease-ambient group-hover:animate-heartbeat" />
					<span>Built by Serticode</span>
				</a>
			</div>
			<span className="inline-flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs text-earth">
				<span>Built for Àyà mí</span>
				<span
					className="animate-gbim inline-block text-sm leading-none"
					role="img"
					aria-label="hibiscus flower"
				>
					🌺
				</span>
			</span>
		</footer>
	);
}
