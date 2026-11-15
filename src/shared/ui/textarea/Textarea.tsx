import type {
    TextareaHTMLAttributes,
} from "react";

type TextareaProps =
    TextareaHTMLAttributes<HTMLTextAreaElement> & {
        invalid?: boolean;
    };

export function Textarea({
    className = "",
    invalid = false,
    ...props
}: TextareaProps) {
    return (
        <textarea
            {...props}
            aria-invalid={invalid}
            className={`w-full resize-none rounded-2xl border bg-[var(--bg-primary)] px-4 py-[13px] text-sm text-[var(--text-primary)] outline-none transition-all duration-300 placeholder:text-[var(--text-secondary)] ${invalid
                    ? "border-[var(--error-primary)] hover:border-[var(--error-primary)] focus:border-[var(--error-primary)]"
                    : "border-[var(--border-primary)] hover:border-[var(--border-hover)] focus:border-[var(--border-hover)] focus:shadow-[var(--shadow-primary)]"
                } ${className}`}
        />
    );
}