"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
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
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import {
    POST_BLOCK_LABELS,
    POST_BLOCK_TYPES,
    createPostBlock,
    type ImageBlock,
    type PostBlock,
    type PostBlockType,
} from "@/entities/post";
import { Dropdown } from "@/shared/ui/dropdown";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import { isBlockEmpty } from "../../lib/block-structure";

import { BlockCard } from "./BlockCard";
import { TextBlockEditor } from "./TextBlockEditor";
import { CalloutBlockEditor } from "./CalloutBlockEditor";
import { CtaBlockEditor } from "./CtaBlockEditor";
import { FaqBlockEditor } from "./FaqBlockEditor";
import { ImageBlockEditor, type PendingImage } from "./ImageBlockEditor";

type PostContentProps = {
    blocks: PostBlock[];
    pendingImages: Record<string, PendingImage>;
    coverUrl: string | null;
    pendingCoverFile: File | null;
    showErrors: boolean;
    onChange: Dispatch<SetStateAction<PostBlock[]>>;
    onPendingImageChange: (blockId: string, file: File | null) => void;
    onMakeCover: (blockId: string) => void;
};

export function PostContent({
    blocks,
    pendingImages,
    coverUrl,
    pendingCoverFile,
    showErrors,
    onChange,
    onPendingImageChange,
    onMakeCover,
}: PostContentProps) {
    const [blockToDelete, setBlockToDelete] = useState<PostBlock | null>(null);

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

    function isBlockCover(block: ImageBlock): boolean {
        const pending = pendingImages[block.id];

        if (pending) {
            return pendingCoverFile === pending.file;
        }

        return !pendingCoverFile && Boolean(block.url) && block.url === coverUrl;
    }

    function addBlock(type: PostBlockType) {
        onChange((prev) => [...prev, createPostBlock(type)]);
    }

    function updateBlock(next: PostBlock) {
        onChange((prev) =>
            prev.map((block) => (block.id === next.id ? next : block)),
        );
    }

    function removeBlock(id: string) {
        if (pendingImages[id]) {
            onPendingImageChange(id, null);
        }

        onChange((prev) => prev.filter((block) => block.id !== id));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        onChange((prev) => {
            const oldIndex = prev.findIndex((block) => block.id === active.id);
            const newIndex = prev.findIndex((block) => block.id === over.id);

            if (oldIndex === -1 || newIndex === -1) {
                return prev;
            }

            return arrayMove(prev, oldIndex, newIndex);
        });
    }

    function renderBlockEditor(block: PostBlock) {
        switch (block.type) {
            case "text":
                return (
                    <TextBlockEditor
                        block={block}
                        invalid={showErrors && isBlockEmpty(block)}
                        onChange={updateBlock}
                    />
                );

            case "image":
                return (
                    <ImageBlockEditor
                        block={block}
                        pending={pendingImages[block.id]}
                        invalid={
                            showErrors && !block.url && !pendingImages[block.id]
                        }
                        altInvalid={showErrors && !block.alt.trim()}
                        isCover={isBlockCover(block)}
                        onChange={updateBlock}
                        onFileSelect={(file) =>
                            onPendingImageChange(block.id, file)
                        }
                        onMakeCover={() => onMakeCover(block.id)}
                    />
                );

            case "callout":
                return (
                    <CalloutBlockEditor
                        block={block}
                        showErrors={showErrors}
                        onChange={updateBlock}
                    />
                );

            case "cta":
                return (
                    <CtaBlockEditor
                        block={block}
                        showErrors={showErrors}
                        onChange={updateBlock}
                    />
                );

            case "faq":
                return (
                    <FaqBlockEditor
                        block={block}
                        showErrors={showErrors}
                        onChange={updateBlock}
                    />
                );
        }
    }

    return (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
            <span className="block text-sm font-medium text-[var(--text-primary)]">
                Вміст
            </span>

            <span className="mb-5 mt-1 block text-xs leading-5 text-[var(--text-secondary)]">
                Блоки спільні для всіх мов: додавання, видалення, порядок і фото
                однакові, а текст у кожній мові свій.
            </span>

            {blocks.length === 0 ? (
                <div
                    className={`mb-4 rounded-2xl border border-dashed p-6 text-center text-sm ${showErrors
                        ? "border-[var(--error-primary)] text-[var(--error-primary)]"
                        : "border-[var(--border-primary)] text-[var(--text-secondary)]"
                        }`}
                >
                    Додайте перший блок
                </div>
            ) : (
                <DndContext
                    id="post-blocks"
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={blocks.map((block) => block.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="mb-4 flex flex-col gap-4">
                            {blocks.map((block) => (
                                <BlockCard
                                    key={block.id}
                                    id={block.id}
                                    label={POST_BLOCK_LABELS[block.type]}
                                    onRemove={() => setBlockToDelete(block)}
                                >
                                    {renderBlockEditor(block)}
                                </BlockCard>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <Dropdown
                menuClassName="w-[240px]"
                renderTrigger={({ toggle }) => (
                    <button
                        type="button"
                        onClick={toggle}
                        className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--border-primary)] px-4 text-sm font-medium text-[var(--accent-primary)] transition hover:border-[var(--border-hover)]"
                    >
                        + Додати блок
                    </button>
                )}
            >
                {({ close }) =>
                    POST_BLOCK_TYPES.map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => {
                                close();
                                addBlock(type);
                            }}
                            className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)]"
                        >
                            {POST_BLOCK_LABELS[type]}
                        </button>
                    ))
                }
            </Dropdown>

            <ConfirmDialog
                open={blockToDelete !== null}
                title="Видалити блок?"
                description={
                    blockToDelete
                        ? `Блок «${POST_BLOCK_LABELS[blockToDelete.type]}» буде видалено в усіх мовах разом із вмістом.`
                        : undefined
                }
                confirmLabel="Видалити"
                destructive
                onConfirm={() => {
                    if (blockToDelete) {
                        removeBlock(blockToDelete.id);
                    }

                    setBlockToDelete(null);
                }}
                onCancel={() => setBlockToDelete(null)}
            />
        </div>
    );
}