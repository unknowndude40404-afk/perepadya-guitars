"use client";

import {
	ReactNode,
	useState,
} from "react";

import { Dropdown } from "@/shared/ui/dropdown";

export type DropdownOption = {
	label: string;
	value: string;
};

type SelectDropdownProps = {
	options: readonly DropdownOption[];

	defaultValue?: string;

	onChange?: (value: string) => void;

	className?: string;

	menuClassName?: string;

	invalid?: boolean;

	renderTrigger: (props: {
		open: boolean;
		selectedOption?: DropdownOption;
		invalid: boolean;
		toggle: () => void;
	}) => ReactNode;
};

export function SelectDropdown({
	options,
	defaultValue,
	onChange,
	className = "",
	menuClassName = "",
	invalid = false,
	renderTrigger,
}: SelectDropdownProps) {
	const fallbackValue =
		defaultValue ?? options[0]?.value;

	const [value, setValue] =
		useState(fallbackValue);

	// Reset the selection when the default value from props changes.
	const [syncedValue, setSyncedValue] =
		useState(fallbackValue);

	if (syncedValue !== fallbackValue) {
		setSyncedValue(fallbackValue);
		setValue(fallbackValue);
	}

	const selectedOption = options.find(
		(option) => option.value === value,
	);

	const selectOption = (
		option: DropdownOption,
		close: () => void,
	) => {
		close();

		if (option.value === value) {
			return;
		}

		setValue(option.value);

		onChange?.(option.value);
	};

	return (
		<Dropdown
			className={className}
			menuClassName={`w-max ${menuClassName}`}
			renderTrigger={({ open, toggle }) =>
				renderTrigger({
					open,
					selectedOption,
					invalid,
					toggle,
				})
			}
		>
			{({ close }) =>
				options.map((option) => {
					const active =
						option.value === value;

					return (
						<button
							key={option.value}
							type="button"
							onClick={() =>
								selectOption(
									option,
									close,
								)
							}
							className="flex w-full cursor-pointer items-center justify-between gap-4 whitespace-nowrap px-4 py-3 text-left text-sm text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--card-bg-hover)]"
						>
							<span>
								{option.label}
							</span>

							{active && (
								<span className="text-[var(--accent-primary)]">
									✓
								</span>
							)}
						</button>
					);
				})
			}
		</Dropdown>
	);
}