import type {
    ButtonHTMLAttributes,
    ReactNode,
} from "react";

type ButtonProps =
    ButtonHTMLAttributes<HTMLButtonElement> & {
        children: ReactNode;
        loading?: boolean;
    };

export function Button({
    children,
    className = "",
    loading = false,
    disabled,
    ...props
}: ButtonProps) {
    const isDisabled = disabled || loading;

    return (
        <button
            {...props}
            disabled={isDisabled}
            className={`inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${className}`}
        >
            {loading ? (
                <span
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            ) : null}

            {children}
        </button>
    );
}