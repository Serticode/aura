import { useEffect, useRef, useState, type CSSProperties } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppUpdate } from "@/app/useAppUpdate";
import { AppUpdate } from "@/app/AppUpdate";
import { useCanvas } from "@/app/useCanvas";
import { useAppearance } from "@/app/useAppearance";
import { usePreferences } from "@/data/usePreferences";
import { useInteractionSounds } from "@/audio/useInteractionSounds";
import { Attribution } from "@/components/Attribution";
import { BrandHeader } from "@/components/BrandHeader";
import { Settings } from "@/features/settings/Settings";

export function AppShell() {
	useInteractionSounds();
	const { flags, ready } = usePreferences();
	const appearance = useAppearance();
	const appUpdate = useAppUpdate();
	const { view, viewport, dragging, pointerDown, pointerMove, pointerUp } =
		useCanvas();
	const location = useLocation();
	const navigate = useNavigate();
	const [requestedSettings, setSettingsOpen] = useState(false);
	const settingsOpen = requestedSettings || location.pathname === "/settings";
	const [closing, setClosing] = useState(false);
	const panel = useRef<HTMLDialogElement>(null);
	const settingsButton = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (settingsOpen) panel.current!.showModal();
	}, [settingsOpen]);
	const closeSettings = () => setClosing(true);
	function finishClose() {
		panel.current!.close();
		setClosing(false);
		setSettingsOpen(false);
		settingsButton.current?.focus();
		if (location.pathname === "/settings") navigate("/", { replace: true });
	}
	const paths = {
		home: "M3 10 12 3l9 7v10h-6v-7H9v7H3Z",
		mirror:
			"M8 3h8a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3ZM9 9l2-2m0 10 4-4",
		settings:
			"M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3ZM15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0",
		sun: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1",
		moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z",
	};
	const icon = (path: string) => (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="h-5 w-5"
		>
			<path d={path} />
		</svg>
	);
	const tool = "canvas-tool";
	return (
		<div
			data-theme={appearance.dark ? "dark" : "light"}
			data-reduced-motion={flags.reducedMotion === true}
			className="aura-space relative h-svh overflow-hidden text-charcoal"
			style={
				{
					"--canvas-zoom": view.scale,
					"--canvas-x": `${view.x}px`,
					"--canvas-y": `${view.y}px`,
				} as CSSProperties
			}
		>
			<div
				ref={viewport}
				data-testid="canvas-viewport"
				className={`absolute inset-0 overflow-hidden ${dragging ? "cursor-grabbing select-none" : "cursor-grab"}`}
				onPointerDown={pointerDown}
				onPointerMove={pointerMove}
				onPointerUp={pointerUp}
				onPointerCancel={pointerUp}
				onLostPointerCapture={pointerUp}
			>
				<main
					data-testid="canvas-world"
					className="absolute inset-0 overflow-auto"
				>
					<Outlet />
				</main>
			</div>
			<BrandHeader />
			<nav
				aria-label="Canvas tools"
				className="canvas-toolbar fixed bottom-14 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-mulberry/15 px-3 py-2"
			>
				<NavLink
					end
					to="/"
					aria-label="Home"
					data-tooltip="Home"
					className={tool}
				>
					{icon(paths.home)}
				</NavLink>
				<NavLink
					end
					to="/mirror"
					aria-label="Mirror"
					data-tooltip="Mirror"
					className={tool}
				>
					{icon(paths.mirror)}
				</NavLink>
				<span aria-hidden="true" className="mx-0.5 h-5 w-px bg-earth/20" />
				<button
					type="button"
					disabled={!ready}
					aria-label={
						appearance.dark ? "Switch to light mode" : "Switch to dark mode"
					}
					data-tooltip={appearance.dark ? "Light mode" : "Dark mode"}
					onClick={appearance.toggle}
					className={tool}
				>
					{icon(appearance.dark ? paths.sun : paths.moon)}
				</button>
				<button
					ref={settingsButton}
					type="button"
					aria-label="Settings"
					aria-haspopup="dialog"
					aria-expanded={settingsOpen}
					data-tooltip="Settings"
					onClick={() => {
						setClosing(false);
						setSettingsOpen(true);
					}}
					className={tool}
				>
					{icon(paths.settings)}
				</button>
			</nav>
			<dialog
				ref={panel}
				aria-label="Settings"
				data-closing={closing}
				data-theme={appearance.dark ? "dark" : "light"}
				className="settings-panel"
				onCancel={(event) => {
					if (event.target !== event.currentTarget) return;
					event.preventDefault();
					closeSettings();
				}}
				onClick={(event) => {
					if (event.target !== event.currentTarget) return;
					const rect = event.currentTarget.getBoundingClientRect();
					if (
						event.clientX < rect.left ||
						event.clientX > rect.right ||
						event.clientY < rect.top ||
						event.clientY > rect.bottom
					)
						closeSettings();
				}}
				onAnimationEnd={(event) => {
					if (event.target === event.currentTarget && closing) finishClose();
				}}
			>
				<button
					type="button"
					aria-label="Close settings"
					onClick={closeSettings}
					className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full text-earth hover:bg-petal/30 focus-visible:outline-2 focus-visible:outline-rose"
				>
					{icon("M6 6l12 12M18 6 6 18")}
				</button>
				<Settings dark={appearance.dark} onToggleTheme={appearance.toggle} />
				<AppUpdate
					session={appUpdate}
					inSettings={true}
					onOpenSettings={() => setSettingsOpen(true)}
				/>
			</dialog>
			{!settingsOpen && (
				<AppUpdate
					session={appUpdate}
					inSettings={false}
					onOpenSettings={() => setSettingsOpen(true)}
				/>
			)}
			<Attribution />
		</div>
	);
}
