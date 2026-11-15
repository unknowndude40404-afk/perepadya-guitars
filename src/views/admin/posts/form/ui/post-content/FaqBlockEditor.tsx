"use client";

import { createFaqItem, type FaqBlock, type FaqItem } from "@/entities/post";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type FaqBlockEditorProps = {
    block: FaqBlock;
    onChange: (block: FaqBlock) => void;
};

export function FaqBlockEditor({ block, onChange }: FaqBlockEditorProps) {
    function updateItem(next: FaqItem) {
        onChange({
            ...block,
            items: block.items.map((item) => (item.id === next.id ? next : item)),
        });
    }

    function removeItem(id: string) {
        onChange({
            ...block,
            items: block.items.filter((item) => item.id !== id),
        });
    }

    function addItem() {
        onChange({ ...block, items: [...block.items, createFaqItem()] });
    }

    return (
        <div className="flex flex-col gap-4">
            {block.items.map((item, index) => (
                <div
                    key={item.id}
                    className="rounded-2xl border border-[var(--border-primary)] p-4"
                >
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                            Питання {index + 1}
                        </span>

                        {block.items.length > 1 ? (
                            <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                aria-label="Видалити питання"
                                title="Видалити питання"
                                className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm text-[var(--error-primary)] transition hover:bg-[var(--bg-secondary)]"
                            >
                                ✕
                            </button>
                        ) : null}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Input
                            value={item.question}
                            onChange={(event) =>
                                updateItem({ ...item, question: event.target.value })
                            }
                            placeholder="Питання"
                        />

                        <Textarea
                            value={item.answer}
                            onChange={(event) =>
                                updateItem({ ...item, answer: event.target.value })
                            }
                            placeholder="Відповідь"
                            rows={3}
                        />
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={addItem}
                className="flex h-11 w-fit cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--border-primary)] px-4 text-sm font-medium text-[var(--accent-primary)] transition hover:border-[var(--border-hover)]"
            >
                + Додати питання
            </button>
        </div>
    );
}