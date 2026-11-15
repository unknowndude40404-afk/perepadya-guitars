"use client";

import Image from "next/image";

import {
    CALLOUT_VARIANT_LABELS,
    type CalloutBlock,
    type CalloutVariant,
} from "@/entities/post";
import { Textarea } from "@/shared/ui/textarea";
import { SelectDropdown } from "@/shared/ui/select-dropdown";

const VARIANT_OPTIONS = (
    Object.keys(CALLOUT_VARIANT_LABELS) as CalloutVariant[]
).map((value) => ({ value, label: CALLOUT_VARIANT_LABELS[value] }));

function isCalloutVariant(value: string): value is CalloutVariant {
    return Object.hasOwn(CALLOUT_VARIANT_LABELS, value);
}

type CalloutBlockEditorProps = {
    block: CalloutBlock;
    onChange: (block: CalloutBlock) => void;
    showErrors?: boolean;
};

export function CalloutBlockEditor({
    block,
    onChange,
    showErrors = false,
}: CalloutBlockEditorProps) {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <span className="mb-2 block text-sm text-[var(--text-secondary)]">
                    Тип
                </span>

                <SelectDropdown
                    options={VARIANT_OPTIONS}
                    defaultValue={block.variant}
                    onChange={(value) => {
                        if (isCalloutVariant(value)) {
                            onChange({ ...block, variant: value });
                        }
                    }}
                    className="w-full"
                    renderTrigger={({ open, selectedOption, toggle }) => (
                        <button
                            type="button"
                            onClick={toggle}
                            aria-expanded={open}
                            className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-[13px] text-left text-[16px] text-[var(--text-primary)] outline-none transition-all duration-300 hover:border-[var(--border-hover)] focus:border-[var(--border-hover)] focus:shadow-[var(--shadow-primary)]"
                        >
                            {selectedOption?.label}

                            <Image
                                src="/icons/arrow.svg"
                                alt=""
                                width={16}
                                height={16}
                                className={`transition-transform duration-200 ${open ? "rotate-180" : ""
                                    }`}
                            />
                        </button>
                    )}
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
                    invalid={showErrors && !block.text.trim()}
                    rows={3}
                />
            </div>
        </div>
    );
}