"use client";

import type { ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type BlockCardProps = {
    id: string;
    label: string;
    onRemove: () => void;
    children: ReactNode;
};

export function BlockCard({ id, label, onRemove, children }: BlockCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Translate.toString(transform),
                transition,
            }}
            className={`relative rounded-2xl border bg-[var(--bg-primary)] ${isDragging
                ? "z-10 border-[var(--accent-primary)] opacity-80 shadow-[var(--shadow-primary)]"
                : "border-[var(--border-primary)]"
                }`}
        >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-primary)] px-2 py-2">
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        ref={setActivatorNodeRef}
                        {...attributes}
                        {...listeners}
                        aria-label="Перетягнути блок"
                        title="Перетягнути"
                        className="flex size-8 cursor-grab touch-none items-center justify-center rounded-lg text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] active:cursor-grabbing"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-4"
                            aria-hidden
                        >
                            <circle cx="9" cy="6" r="1.5" />
                            <circle cx="15" cy="6" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="18" r="1.5" />
                            <circle cx="15" cy="18" r="1.5" />
                        </svg>
                    </button>

                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                        {label}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Видалити блок"
                    title="Видалити блок"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm text-[var(--error-primary)] transition hover:bg-[var(--bg-secondary)]"
                >
                    ✕
                </button>
            </div>

            <div className="p-4">{children}</div>
        </div>
    );
}