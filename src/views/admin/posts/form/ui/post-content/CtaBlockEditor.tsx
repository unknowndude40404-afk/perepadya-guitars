"use client";

import type { CtaBlock } from "@/entities/post";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";

type CtaBlockEditorProps = {
    block: CtaBlock;
    onChange: (block: CtaBlock) => void;
};

export function CtaBlockEditor({ block, onChange }: CtaBlockEditorProps) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <span className="mb-2 block text-sm text-[var(--text-secondary)]">
                    Заголовок
                </span>

                <Input
                    value={block.title}
                    onChange={(event) =>
                        onChange({ ...block, title: event.target.value })
                    }
                    placeholder="Заголовок"
                />
            </div>

            <div>
                <span className="mb-2 block text-sm text-[var(--text-secondary)]">
                    Текст
                </span>

                <Textarea
                    value={block.text}
                    onChange={(event) =>
                        onChange({ ...block, text: event.target.value })
                    }
                    placeholder="Текст"
                    rows={2}
                />
            </div>

            <div>
                <span className="mb-2 block text-sm text-[var(--text-secondary)]">
                    Текст кнопки
                </span>

                <Input
                    value={block.buttonLabel}
                    onChange={(event) =>
                        onChange({ ...block, buttonLabel: event.target.value })
                    }
                    placeholder="Текст кнопки"
                />
            </div>
        </div>
    );
}