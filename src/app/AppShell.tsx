import { AppUpdate } from '@/app/AppUpdate';
import { usePreferences } from '@/data/usePreferences';
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Attribution } from "@/components/Attribution";
import { BrandHeader } from "@/components/BrandHeader";

const spaces = [
	{ to: "/mirror", label: "Mirror" },
	{ to: "/pulse", label: "Pulse" },
	{ to: "/gathering", label: "Gathering" },
	{ to: "/settings", label: "Settings" },
] as const;

const onboardingPaths = ["/"] as const;

export function AppShell() {
	const location = useLocation();
	const { flags } = usePreferences();
	const inOnboarding = onboardingPaths.some((path) => path === location.pathname);
	const isWideCanvas = location.pathname === "/" || location.pathname === "/settings" || location.pathname === "/mirror";

	return (
		<div data-reduced-motion={flags.reducedMotion === true} className="min-h-screen bg-ivory text-charcoal">
			<BrandHeader />
			<main className={`mx-auto flex min-h-screen w-full flex-col${isWideCanvas ? "" : " max-w-md"}`}>
				<Outlet />
			</main>
			{!inOnboarding && (
				<nav
					aria-label="Spaces"
					className="animate-fade fixed inset-x-0 bottom-8 mx-auto flex w-full max-w-xl justify-around border-t border-earth/10 bg-ivory py-2"
					style={{ animationDelay: "400ms" }}>
					{spaces.map((space) => (
						<NavLink
							key={space.to}
							to={space.to}
							end
							className={({ isActive }) =>
								[
									"rounded-full px-4 py-2 text-sm transition-colors duration-200 ease-ambient active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
									isActive ? "bg-rose/15 font-medium text-rose-deep" : "text-earth hover:bg-rose/5",
								].join(" ")
							}>
							{space.label}
						</NavLink>
					))}
				</nav>
			)}
			<AppUpdate />
			<Attribution />
		</div>
	);
}
