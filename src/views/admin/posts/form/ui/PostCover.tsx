"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import {
    POST_IMAGE_ERROR_MESSAGES,
    validatePostImage,
} from "@/entities/post/lib/upload-post-image";

import type { PendingImage } from "./post-content";

type PostCoverProps = {
    coverUrl: string | null;
    pending: PendingImage | null;
    onFileSelect: (file: File) => void;
    onRemove: () => void;
};

export function PostCover({
    coverUrl,
    pending,
    onFileSelect,
    onRemove,
}: PostCoverProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [error, setError] = useState<string | null>(null);

    const previewSrc = pending?.previewUrl ?? coverUrl;

    function handleFile(file: File | undefined) {
        if (!file) {
            return;
        }

        const reason = validatePostImage(file);

        if (reason) {
            setError(POST_IMAGE_ERROR_MESSAGES[reason]);

            return;
        }

        setError(null);
        onFileSelect(file);
    }

    return (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
            <span className="mb-5 block text-sm font-medium text-[var(--text-primary)]">
                Обкладинка
            </span>

            {previewSrc ? (
                <div className="relative mx-auto aspect-[16/9] w-full max-w-[480px] overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <Image
                        src={previewSrc}
                        alt=""
                        fill
                        sizes="480px"
                        unoptimized={Boolean(pending)}
                        className="object-cover"
                    />

                    <button
                        type="button"
                        onClick={onRemove}
                        aria-label="Прибрати обкладинку"
                        title="Прибрати"
                        className="absolute right-3 top-3 flex size-8 cursor-pointer items-center justify-center rounded-lg bg-black/60 transition hover:bg-black/80"
                    >
                        <Image
                            src="/icons/delete.svg"
                            alt=""
                            width={16}
                            height={16}
                        />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border-primary)] text-sm text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                >
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="size-6"
                        aria-hidden
                    >
                        <path d="M12 5v14M5 12h14" />
                    </svg>
                    Обрати обкладинку
                </button>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="image/webp"
                onChange={(event) => {
                    handleFile(event.target.files?.[0]);
                    event.target.value = "";
                }}
                className="hidden"
            />

            {error ? (
                <div className="mt-3 text-sm text-[var(--error-primary)]">{error}</div>
            ) : null}
        </div>
    );
}