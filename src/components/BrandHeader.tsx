export function BrandHeader() {
	return (
		<header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center gap-2.5 px-6 py-5 md:px-9">
			<img
				src="/aura-logo-mulberry.svg"
				alt=""
				aria-hidden="true"
				className="h-8 w-8"
			/>
			<div>
				<p className="font-display text-xl leading-none text-heading">aura</p>
			</div>
		</header>
	);
}
