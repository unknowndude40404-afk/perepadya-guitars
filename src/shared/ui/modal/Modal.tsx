"use client";

import {
    type ReactNode,
    useEffect,
} from "react";

type ModalProps = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
    closeIcon?: ReactNode;
    closeOnOverlayClick?: boolean;
    className?: string;
};

export function Modal({
    open,
    onClose,
    children,
    closeIcon,
    closeOnOverlayClick = true,
    className = "",
}: ModalProps) {
    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow =
            "hidden";

        function handleKeyDown(
            event: KeyboardEvent,
        ) {
            if (event.key === "Escape") {
                onClose();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            document.body.style.overflow =
                previousOverflow;

            document.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, [open, onClose]);

    return (
        <div
            className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${open
                ? "pointer-events-auto opacity-100"
                : "pointer-events-none opacity-0"
                }`}
            role="dialog"
            aria-modal="true"
            aria-hidden={!open}
            inert={!open}
        >
            <button
                type="button"
                aria-label="Закрити модальне вікно"
                onClick={
                    closeOnOverlayClick
                        ? onClose
                        : undefined
                }
                className="absolute inset-0 h-full w-full cursor-default bg-[var(--overlay-bg)] backdrop-blur-[2px]"
            />

            <div
                className={`relative z-10 w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[var(--border-primary)] bg-[var(--card-bg)] shadow-[var(--shadow-primary)] transition-all duration-300 ease-out ${open
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-4 scale-[0.97] opacity-0"
                    } ${className}`}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Закрити"
                    className="absolute right-4 top-4 z-20 flex size-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] text-lg text-[var(--text-primary)] shadow-[var(--shadow-primary)] transition-transform duration-200 active:scale-95"
                >
                    {closeIcon ?? "✕"}
                </button>

                {children}
            </div>
        </div>
    );
}