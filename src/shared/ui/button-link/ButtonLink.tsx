import Link, {
    type LinkProps,
} from "next/link";

import type {
    AnchorHTMLAttributes,
    ReactNode,
} from "react";

type ButtonLinkProps =
    LinkProps &
    Omit<
        AnchorHTMLAttributes<HTMLAnchorElement>,
        keyof LinkProps
    > & {
        children: ReactNode;
    };

export function ButtonLink({
    children,
    className = "",
    ...props
}: ButtonLinkProps) {
    return (
        <Link
            {...props}
            className={`inline-flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 ${className}`}
        >
            {children}
        </Link>
    );
}