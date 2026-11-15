"use client";

import Image from "next/image";
import { useRef, useState } from "react";

import type { ImageBlock } from "@/entities/post";
import {
    POST_IMAGE_ERROR_MESSAGES,
    validatePostImage,
} from "@/entities/post/lib/upload-post-image";
import { Input } from "@/shared/ui/input";

export type PendingImage = {
    file: File;
    previewUrl: string;
};

type ImageBlockEditorProps = {
    block: ImageBlock;
    pending: PendingImage | undefined;
    invalid: boolean;
    altInvalid: boolean;
    isCover: boolean;
    onChange: (block: ImageBlock) => void;
    onFileSelect: (file: File | null) => void;
    onMakeCover: () => void;
};

function StarIcon({ filled }: { filled: boolean }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill={filled ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
            className="size-4"
            aria-hidden
        >
            <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
        </svg>
    );
}

export function ImageBlockEditor({
    block,
    pending,
    invalid,
    altInvalid,
    isCover,
    onChange,
    onFileSelect,
    onMakeCover,
}: ImageBlockEditorProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [error, setError] = useState<string | null>(null);

    const previewSrc = pending?.previewUrl ?? (block.url || null);

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

    function handleRemoveImage() {
        onFileSelect(null);
        onChange({ ...block, url: "", width: null, height: null });
    }

    

    return (
        <div className="flex flex-col gap-4">
            {previewSrc ? (
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]">
                    <Image
                        src={previewSrc}
                        alt=""
                        width={1200}
                        height={800}
                        unoptimized={Boolean(pending)}
                        className="h-auto max-h-[420px] w-full object-contain"
                    />

                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        aria-label="Прибрати зображення"
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
                    className={`flex h-40 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-sm transition ${invalid
                        ? "border-[var(--error-primary)] text-[var(--error-primary)]"
                        : "border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                        }`}
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
                    Обрати зображення
                </button>
            )}

            {previewSrc ? (
                isCover ? (
                    <div className="flex items-center gap-2 text-sm font-medium text-[var(--accent-primary)]">
                        <StarIcon filled />
                        Обкладинка
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onMakeCover}
                        className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-[var(--border-primary)] px-3 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
                    >
                        <StarIcon filled={false} />
                        Зробити обкладинкою
                    </button>
                )
            ) : null}

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
                <div className="text-sm text-[var(--error-primary)]">{error}</div>
            ) : null}

            {invalid && !previewSrc ? (
                <div className="text-sm text-[var(--error-primary)]">
                    Додайте зображення або видаліть блок
                </div>
            ) : null}

            <div>
                <span className="mb-2 block text-sm text-[var(--text-secondary)]">
                    Опис зображення (alt)
                </span>

                <Input
                    value={block.alt}
                    onChange={(event) =>
                        onChange({ ...block, alt: event.target.value })
                    }
                    placeholder="Що зображено на картинці"
                    invalid={altInvalid}
                />
            </div>
        </div>
    );
}