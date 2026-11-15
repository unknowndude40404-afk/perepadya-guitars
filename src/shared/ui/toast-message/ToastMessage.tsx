"use client";

import {
    useEffect,
    useState,
} from "react";
import { createPortal } from "react-dom";

type ToastMessageProps = {
    text: string;
    variant?: "default" | "error";
    duration?: number;
    onClose?: () => void;
    className?: string;
};

export function ToastMessage({
    text,
    variant = "default",
    duration = 1800,
    onClose,
    className = "",
}: ToastMessageProps) {
    const [visible, setVisible] =
        useState(false);

    useEffect(() => {
        const showFrame =
            requestAnimationFrame(() => {
                setVisible(true);
            });

        const hideTimeout =
            setTimeout(() => {
                setVisible(false);
            }, duration);

        const closeTimeout =
            setTimeout(() => {
                onClose?.();
            }, duration + 300);

        return () => {
            cancelAnimationFrame(showFrame);
            clearTimeout(hideTimeout);
            clearTimeout(closeTimeout);
        };
    }, [
        duration,
        onClose,
    ]);

    if (
        typeof document ===
        "undefined"
    ) {
        return null;
    }

    return createPortal(
        <div
            className={`fixed bottom-6 left-1/2 z-[9999] rounded-md bg-[var(--toast-bg)] px-3.5 py-2 text-sm font-medium shadow-[var(--shadow-primary)] transition-all duration-300 ease-out ${visible
                    ? "-translate-x-1/2 translate-y-0 opacity-100"
                    : "-translate-x-1/2 translate-y-3 opacity-0"
                } ${variant === "error"
                    ? "text-[var(--error-primary)]"
                    : "text-[var(--toast-text)]"
                } ${className}`}
        >
            {text}
        </div>,
        document.body,
    );
}