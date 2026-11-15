"use client";

import { InputHTMLAttributes } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
	label: string;
};

export function Checkbox({ label, className = "", ...props }: CheckboxProps) {
	return (
		<label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
			<input
				type="checkbox"
				className={`h-4 w-4 cursor-pointer accent-[var(--accent-primary)] ${className}`}
				{...props}
			/>

			<span>{label}</span>
		</label>
	);
}