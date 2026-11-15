"use client";

import { useRef, useState } from "react";
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { SortableImage } from "./SortableImage";
import {
    createImageDraft,
    validateFile,
    MAX_PRODUCT_IMAGES,
    type ProductImageDraft,
} from "./product-images.lib";

type ProductImagesProps = {
    images: ProductImageDraft[];
    invalid?: boolean;
    onChange: (images: ProductImageDraft[]) => void;
};

export function ProductImages({
    images,
    invalid = false,
    onChange,
}: ProductImagesProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [error, setError] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const canAdd = images.length < MAX_PRODUCT_IMAGES;

    function handleFiles(fileList: FileList | null) {
        if (!fileList) {
            return;
        }

        setError(null);

        const files = Array.from(fileList);

        const free = MAX_PRODUCT_IMAGES - images.length;

        if (files.length > free) {
            setError(`Максимум ${MAX_PRODUCT_IMAGES} зображень`);
        }

        const accepted: ProductImageDraft[] = [];

        for (const file of files.slice(0, free)) {
            const fileError = validateFile(file);

            if (fileError) {
                setError(fileError);

                continue;
            }

            accepted.push(createImageDraft(file));
        }

        if (accepted.length) {
            onChange([...images, ...accepted]);
        }
    }

    function handleRemove(key: string) {
        const target = images.find((image) => image.key === key);

        if (target?.kind === "new") {
            URL.revokeObjectURL(target.previewUrl);
        }

        onChange(images.filter((image) => image.key !== key));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = images.findIndex((image) => image.key === active.id);

        const newIndex = images.findIndex((image) => image.key === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        onChange(arrayMove(images, oldIndex, newIndex));
    }

    return (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                    Зображення
                </span>

                <span className="text-xs text-[var(--text-secondary)]">
                    {images.length} / {MAX_PRODUCT_IMAGES}
                </span>
            </div>

            <DndContext
                id="product-images"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={images.map((image) => image.key)}
                    strategy={rectSortingStrategy}
                >
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:grid-cols-6">
                        {images.map((image, index) => (
                            <SortableImage
                                key={image.key}
                                image={image}
                                isMain={index === 0}
                                onRemove={() => handleRemove(image.key)}
                            />
                        ))}

                        {canAdd ? (
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className={`flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-sm transition ${invalid
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
                                >
                                    <path d="M12 5v14M5 12h14" />
                                </svg>

                                Додати
                            </button>
                        ) : null}
                    </div>
                </SortableContext>
            </DndContext>

            <input
                ref={inputRef}
                type="file"
                accept="image/webp"
                multiple
                onChange={(event) => {
                    handleFiles(event.target.files);
                    event.target.value = "";
                }}
                className="hidden"
            />

            {invalid ? (
                <div className="mt-3 text-sm text-[var(--error-primary)]">
                    Додайте хоча б одне зображення
                </div>
            ) : null}

            {error ? (
                <div className="mt-3 text-sm text-[var(--error-primary)]">
                    {error}
                </div>
            ) : null}

            {images.length > 1 ? (
                <div className="mt-3 text-xs text-[var(--text-secondary)]">
                    Перетягніть, щоб змінити порядок. Перше зображення — головне
                    в каталозі.
                </div>
            ) : null}
        </div>
    );
}