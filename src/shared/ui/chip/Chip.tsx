import type { ReactNode } from "react";

type ChipProps = {
    children: ReactNode;
    className?: string;
    onRemove?: () => void;
    removeLabel?: string;
};

export function Chip({
    children,
    className = "",
    onRemove,
    removeLabel = "Прибрати",
}: ChipProps) {
    return (
        <span
            className={`inline-flex items-center gap-2 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] py-2 text-sm text-[var(--text-primary)] ${onRemove ? "pl-4 pr-2" : "px-4"
                } ${className}`}
        >
            {children}

            {onRemove ? (
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={removeLabel}
                    className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--error-primary)]"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        className="size-3.5"
                    >
                        <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                </button>
            ) : null}
        </span>
    );
}