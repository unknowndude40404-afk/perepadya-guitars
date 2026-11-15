"use client";

type SegmentedOption<T extends string> = {
    value: T;
    label: string;
};

type SegmentedControlProps<T extends string> = {
    options: readonly SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    ariaLabel: string;
    className?: string;
};

export function SegmentedControl<T extends string>({
    options,
    value,
    onChange,
    ariaLabel,
    className = "",
}: SegmentedControlProps<T>) {
    return (
        <div
            role="radiogroup"
            aria-label={ariaLabel}
            className={`grid gap-[4px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-[4px] ${className}`}
            style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        >
            {options.map((option) => {
                const isActive = option.value === value;

                return (
                    <button
                        key={option.value}
                        type="button"
                        role="radio"
                        aria-checked={isActive}
                        onClick={() => onChange(option.value)}
                        className={`h-10 cursor-pointer rounded-xl px-4 text-sm font-medium transition-all duration-300 ${isActive
                            ? "bg-[var(--accent-primary)] text-black"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            }`}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
