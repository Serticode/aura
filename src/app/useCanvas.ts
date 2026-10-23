import { useEffect, useRef, useState, type PointerEvent } from "react";

interface View {
	readonly x: number;
	readonly y: number;
	readonly scale: number;
}
const initialView: View = { x: 0, y: 0, scale: 1 };
const isControl = (target: EventTarget | null) =>
	target instanceof Element &&
	target.closest(
		"button, a, input, textarea, summary, dialog, select, [data-no-pan]",
	) !== null;

export function useCanvas() {
	const [view, setView] = useState<View>(initialView);
	const viewport = useRef<HTMLDivElement>(null);
	const drag = useRef<{ x: number; y: number; pointer: number } | null>(null);
	const [dragging, setDragging] = useState(false);

	function zoomBy(factor: number) {
		setView((current) => ({
			...current,
			scale: Math.min(
				1.75,
				Math.max(0.4, Math.round(current.scale * factor * 100) / 100),
			),
		}));
	}
	useEffect(() => {
		const element = viewport.current!;
		function wheel(event: WheelEvent) {
			if (isControl(event.target)) return;
			event.preventDefault();
			if (event.ctrlKey || event.metaKey) {
				const factor = Math.exp(-event.deltaY * 0.01);
				setView((current) => {
					const scale = Math.min(1.75, Math.max(0.4, current.scale * factor));
					const bounds = element.getBoundingClientRect();
					const x = event.clientX - bounds.left - bounds.width / 2;
					const y = event.clientY - bounds.top - bounds.height / 2;
					return {
						scale,
						x: x - ((x - current.x) * scale) / current.scale,
						y: y - ((y - current.y) * scale) / current.scale,
					};
				});
			} else {
				setView((current) => ({
					...current,
					x: current.x - event.deltaX,
					y: current.y - event.deltaY,
				}));
			}
		}
		function key(event: KeyboardEvent) {
			if (
				isControl(event.target) ||
				event.altKey ||
				event.ctrlKey ||
				event.metaKey
			)
				return;
			if (event.key === "+" || event.key === "=") {
				event.preventDefault();
				zoomBy(1.1);
			}
			if (event.key === "-") {
				event.preventDefault();
				zoomBy(1 / 1.1);
			}
			if (event.key === "0") setView(initialView);
		}
		element.addEventListener("wheel", wheel, { passive: false });
		window.addEventListener("keydown", key);
		return () => {
			element.removeEventListener("wheel", wheel);
			window.removeEventListener("keydown", key);
		};
	}, []);

	function pointerDown(event: PointerEvent<HTMLDivElement>) {
		if (
			event.button !== 0 ||
			isControl(event.target) ||
			event.pointerType === "touch"
		)
			return;
		drag.current = {
			x: event.clientX,
			y: event.clientY,
			pointer: event.pointerId,
		};
		event.currentTarget.setPointerCapture(event.pointerId);
		setDragging(true);
	}
	function pointerMove(event: PointerEvent<HTMLDivElement>) {
		const start = drag.current;
		if (start === null || start.pointer !== event.pointerId) return;
		const x = event.clientX - start.x;
		const y = event.clientY - start.y;
		drag.current = {
			x: event.clientX,
			y: event.clientY,
			pointer: event.pointerId,
		};
		setView((current) => ({ ...current, x: current.x + x, y: current.y + y }));
	}
	function pointerUp() {
		drag.current = null;
		setDragging(false);
	}
	return { view, viewport, dragging, pointerDown, pointerMove, pointerUp };
}
