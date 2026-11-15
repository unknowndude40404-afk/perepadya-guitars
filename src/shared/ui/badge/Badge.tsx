import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "danger";

type BadgeProps = {
    children: ReactNode;
    variant?: BadgeVariant;
    className?: string;
};

const VARIANT_CLASS: Record<BadgeVariant, string> = {
    neutral: "bg-[var(--bg-secondary)] text-[var(--text-secondary)]",
    accent: "bg-[var(--accent-subtle)] text-[var(--accent-primary)]",
    success: "bg-[rgba(22,163,74,0.1)] text-[#16a34a]",
    warning: "bg-[rgba(217,119,6,0.1)] text-[#d97706]",
    danger: "bg-[rgba(220,38,38,0.08)] text-[var(--error-primary)]",
};

export function Badge({
    children,
    variant = "neutral",
    className = "",
}: BadgeProps) {
    return (
        <span
            className={`inline-block whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-medium ${VARIANT_CLASS[variant]} ${className}`}
        >
            {children}
        </span>
    );
}