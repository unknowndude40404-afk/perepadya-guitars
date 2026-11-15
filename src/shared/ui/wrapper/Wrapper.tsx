import type { PropsWithChildren } from "react";

type WrapperProps = PropsWithChildren<{
    className?: string;
}>;

export function Wrapper({
    children,
    className = "",
}: WrapperProps) {
    return (
        <div
            className={[
                "rounded-[28px]",
                "border",
                "border-[var(--border-primary)]",
                "bg-[var(--card-bg)]",
                className,
            ].join(" ")}
        >
            {children}
        </div>
    );
}