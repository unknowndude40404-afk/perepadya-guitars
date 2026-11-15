import Image from "next/image";
import type { ReactNode } from "react";

import { Loader } from "@/shared/ui/loader";

type ResultStateVariant =
    | "success"
    | "error"
    | "pending"
    | "loading";

type ResultStateProps = {
    variant?: ResultStateVariant;
    title?: string;
    subtitle?: string;
    children?: ReactNode;
    text?: string;
    actions?: ReactNode;
    className?: string;
};

const variantIconMap = {
    success: {
        src: "/icons/success.svg",
        width: 38,
        height: 38,
    },
    error: {
        src: "/icons/error.svg",
        width: 34,
        height: 34,
    },
    pending: {
        src: "/icons/pending.svg",
        width: 38,
        height: 38,
    },
} as const;

export function ResultState({
    variant,
    title,
    subtitle,
    children,
    text,
    actions,
    className = "",
}: ResultStateProps) {
    const icon =
        variant === "success" ||
            variant === "error" ||
            variant === "pending"
            ? variantIconMap[variant]
            : null;

    const showLoader =
        variant === "loading";

    return (
        <div
            className={`w-full text-center ${className}`}
        >
            {icon ? (
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--bg-secondary)]">
                    <Image
                        src={icon.src}
                        alt=""
                        width={icon.width}
                        height={icon.height}
                    />
                </div>
            ) : null}

            {showLoader ? (
                <div className="flex justify-center">
                    <Loader />
                </div>
            ) : null}

            {title ? (
                <h2
                    className={`text-2xl font-semibold text-[var(--text-primary)] ${icon || showLoader
                            ? "mt-5"
                            : ""
                        }`}
                >
                    {title}
                </h2>
            ) : null}

            {subtitle ? (
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {subtitle}
                </p>
            ) : null}

            {children ? (
                <div className="mt-4 flex justify-center">
                    {children}
                </div>
            ) : null}

            {text ? (
                <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                    {text}
                </p>
            ) : null}

            {actions ? (
                <div className="mt-8 flex w-full flex-col gap-3">
                    {actions}
                </div>
            ) : null}
        </div>
    );
}