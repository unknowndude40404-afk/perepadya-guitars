"use client";

import {
	ReactNode,
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { useClickOutside } from "@/shared/lib/hooks/use-click-outside";

type DropdownProps = {
	className?: string;
	menuClassName?: string;
	renderTrigger: (props: {
		open: boolean;
		toggle: () => void;
		close: () => void;
	}) => ReactNode;
	children: (props: { close: () => void }) => ReactNode;
};

export function Dropdown({
	className = "",
	menuClassName = "",
	renderTrigger,
	children,
}: DropdownProps) {
	const dropdownRef = useRef<HTMLDivElement | null>(null);
	const menuRef = useRef<HTMLDivElement | null>(null);

	const [open, setOpen] = useState(false);

	const [position, setPosition] = useState({
		top: 0,
		right: 0,
		minWidth: 0,
	});

	const close = useCallback(() => {
		setOpen(false);
	}, []);

	const toggle = () => {
		setOpen((prev) => !prev);
	};

	useClickOutside(dropdownRef, close);

	useLayoutEffect(() => {
		if (!open || !menuRef.current) {
			return;
		}

		const menuRect = menuRef.current.getBoundingClientRect();

		const triggerRect =
			dropdownRef.current?.getBoundingClientRect();

		if (!triggerRect) {
			return;
		}

		const spaceBelow =
			window.innerHeight - triggerRect.bottom;

		const spaceAbove = triggerRect.top;

		const needsSpace = menuRect.height + 8;

		const openUpwards =
			spaceBelow < needsSpace && spaceAbove > spaceBelow;

		setPosition({
			top: openUpwards
				? triggerRect.top - menuRect.height - 8
				: triggerRect.bottom + 8,

			right: Math.max(
				0,
				Math.min(
					window.innerWidth - triggerRect.right,
					window.innerWidth - menuRect.width - 8,
				),
			),

			minWidth: triggerRect.width,
		});
	}, [open]);

	useEffect(() => {
		if (!open) {
			return;
		}

		window.addEventListener("scroll", close, true);
		window.addEventListener("resize", close);

		return () => {
			window.removeEventListener("scroll", close, true);
			window.removeEventListener("resize", close);
		};
	}, [open, close]);

	return (
		<div ref={dropdownRef} className={`relative inline-block ${className}`}>
			{renderTrigger({
				open,
				toggle,
				close,
			})}

			{open && (
				<div
					ref={menuRef}
					style={{
						top: position.top,
						right: position.right,
						minWidth: position.minWidth,
					}}
					className={`fixed z-40 overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-dropdown)] shadow-[var(--shadow-primary)] backdrop-blur ${menuClassName}`}
				>
					{children({ close })}
				</div>
			)}
		</div>
	);
}