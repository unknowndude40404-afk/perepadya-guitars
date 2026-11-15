"use client";

import Image from "next/image";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { getImageSrc, type ProductImageDraft } from "./product-images.lib";

type SortableImageProps = {
    image: ProductImageDraft;
    isMain: boolean;
    onRemove: () => void;
};

export function SortableImage({
    image,
    isMain,
    onRemove,
}: SortableImageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.key });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={`group relative aspect-square overflow-hidden rounded-2xl border bg-[var(--bg-secondary)] ${isDragging
                ? "z-10 border-[var(--accent-primary)] opacity-80 shadow-[var(--shadow-primary)]"
                : "border-[var(--border-primary)]"
                }`}
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
            >
                <Image
                    src={getImageSrc(image)}
                    alt=""
                    fill
                    unoptimized={image.kind === "new"}
                    className="pointer-events-none object-cover"
                    sizes="200px"
                />
            </div>

            {isMain ? (
                <span className="pointer-events-none absolute left-2 top-2 rounded-lg bg-[var(--accent-primary)] px-2 py-1 text-xs font-medium text-white">
                    Головне
                </span>
            ) : null}

            <button
                type="button"
                onClick={onRemove}
                aria-label="Видалити зображення"
                className="absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-lg bg-black/50 opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
            >
                <Image
                    src="/icons/delete.svg"
                    alt=""
                    width={16}
                    height={16}
                />
            </button>
        </div>
    );
}