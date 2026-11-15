import { InputHTMLAttributes } from "react";

type InputProps =
    InputHTMLAttributes<HTMLInputElement> & {
        invalid?: boolean;
    };

export function Input({
    className = "",
    invalid = false,
    ...props
}: InputProps) {
    return (
        <input
            {...props}
            aria-invalid={invalid}
            className={`w-full rounded-2xl border bg-[var(--bg-primary)] px-4 py-[13px] text-sm text-[var(--text-primary)] outline-none transition-all duration-300 placeholder:text-[var(--text-secondary)] ${invalid
                    ? "border-[var(--error-primary)] hover:border-red-500 focus:border-red-500"
                    : "border-[var(--border-primary)] hover:border-[var(--border-hover)] focus:border-[var(--border-hover)] focus:shadow-[var(--shadow-primary)]"
                } ${className}`}
        />
    );
}