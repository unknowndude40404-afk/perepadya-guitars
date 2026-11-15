"use client";

import { useState } from "react";

import { ToastMessage } from "@/shared/ui/toast-message";

type CopyableTextProps = {
    value: string;
    displayValue?: string;
    className?: string;
};

type CopyStatus =
    | "idle"
    | "copied"
    | "error";

export function CopyableText({
    value,
    displayValue,
    className = "",
}: CopyableTextProps) {
    const [status, setStatus] =
        useState<CopyStatus>("idle");

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(
                value,
            );

            setStatus("copied");
        } catch {
            setStatus("error");
        }
    }

    return (
        <>
            <div
                className={`inline-flex items-center gap-2 ${className}`}
            >
                <span className="font-semibold text-[var(--text-primary)]">
                    {displayValue ?? value}
                </span>

                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Скопіювати"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-[var(--text-secondary)] transition-all duration-200 hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] active:scale-95"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="size-[18px]"
                    >
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                </button>
            </div>

            {status === "copied" ? (
                <ToastMessage
                    text="Скопійовано"
                    onClose={() =>
                        setStatus("idle")
                    }
                />
            ) : null}

            {status === "error" ? (
                <ToastMessage
                    text="Не вдалося скопіювати"
                    variant="error"
                    onClose={() =>
                        setStatus("idle")
                    }
                />
            ) : null}
        </>
    );
}