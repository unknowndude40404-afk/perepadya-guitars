"use client";

import type { ReactNode } from "react";

import { Modal } from "@/shared/ui/modal";
import { Button } from "@/shared/ui/button";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    loading?: boolean;
    closeIcon?: ReactNode;
    children?: ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel = "Підтвердити",
    cancelLabel = "Скасувати",
    destructive = false,
    loading = false,
    closeIcon,
    children,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            closeOnOverlayClick={!loading}
            closeIcon={closeIcon}
            className="max-w-[440px]"
        >
            <div className="p-6 pt-16 sm:p-7 sm:pt-16">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                        {title}
                    </h2>

                    {description ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                            {description}
                        </p>
                    ) : null}
                </div>

                {children ? <div className="mt-5">{children}</div> : null}

                <div className="mt-6 space-y-2.5">
                    <Button
                        type="button"
                        onClick={onConfirm}
                        loading={loading}
                        className={`h-12 w-full rounded-xl px-4 text-sm font-medium text-white active:scale-[0.99] ${destructive
                                ? "bg-[var(--error-primary)] hover:opacity-90"
                                : "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)]"
                            }`}
                    >
                        {confirmLabel}
                    </Button>

                    <Button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="h-12 w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-hover)] active:scale-[0.99]"
                    >
                        {cancelLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}