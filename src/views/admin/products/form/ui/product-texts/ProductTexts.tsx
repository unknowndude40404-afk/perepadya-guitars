"use client";

import { useState } from "react";

import {
    DEFAULT_LOCALE,
    LOCALE_META,
    type Locale,
} from "@/shared/i18n/config";
import { Input } from "@/shared/ui/input";
import { LocaleTabs } from "@/shared/ui/locale-tabs";
import { RichTextEditor } from "@/shared/ui/rich-text-editor";
import { Textarea } from "@/shared/ui/textarea";

import {
    SEO_DESCRIPTION_MAX,
    SEO_TITLE_MAX,
    getProductTextErrors,
    hasAnyText,
    hasProductTextErrors,
    type ProductTextDraft,
    type ProductTextsDraft,
} from "./product-texts.lib";

type ProductTextsProps = {
    texts: ProductTextsDraft;
    slug: string;
    showErrors: boolean;
    onChange: (texts: ProductTextsDraft) => void;
};

const labelClass = "mb-2 block text-sm text-[var(--text-secondary)]";
const hintClass =
    "mt-1 flex flex-wrap items-center justify-between gap-2 pl-4 text-xs text-[var(--text-secondary)]";

export function ProductTexts({
    texts,
    slug,
    showErrors,
    onChange,
}: ProductTextsProps) {
    const [activeLocale, setActiveLocale] = useState<Locale>(DEFAULT_LOCALE);

    const text = texts[activeLocale];
    const errors = getProductTextErrors(activeLocale, text);

    function update(patch: Partial<ProductTextDraft>) {
        onChange({
            ...texts,
            [activeLocale]: { ...text, ...patch },
        });
    }

    const isDefault = activeLocale === DEFAULT_LOCALE;

    return (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                    Тексти
                </span>

                <span className="text-xs text-[var(--text-secondary)]">
                    Усі поля обов’язкові для кожної мови
                </span>
            </div>

            <LocaleTabs
                value={activeLocale}
                onChange={setActiveLocale}
                isFilled={(locale) => Boolean(texts[locale].name.trim())}
                isInvalid={(locale) =>
                    showErrors &&
                    hasProductTextErrors(
                        getProductTextErrors(locale, texts[locale]),
                    )
                }
            />

            <div className="mt-5 text-xs text-[var(--text-secondary)]">
                {LOCALE_META[activeLocale].nativeName}
                {!hasAnyText(text) ? " — ще не заповнено" : null}
            </div>

            <div className="mt-3">
                <label className={labelClass}>Назва</label>

                <Input
                    type="text"
                    value={text.name}
                    onChange={(event) => update({ name: event.target.value })}
                    placeholder="Назва"
                    invalid={showErrors && errors.name}
                />

                {isDefault ? (
                    <div className="mt-1 pl-4 text-xs text-[var(--text-secondary)]">
                        {slug || "—"}
                    </div>
                ) : null}
            </div>

            <div className="mt-5">
                <label className={labelClass}>Опис</label>

                <div
                    className={`rounded-2xl ${showErrors && errors.description
                        ? "ring-1 ring-[var(--error-primary)]"
                        : ""
                        }`}
                >
                    <RichTextEditor
                        key={activeLocale}
                        value={text.description}
                        onChange={(value) => update({ description: value })}
                    />
                </div>
            </div>

            <div className="mt-5">
                <label className={labelClass}>SEO-заголовок</label>

                <Input
                    type="text"
                    value={text.seoTitle}
                    onChange={(event) => update({ seoTitle: event.target.value })}
                    placeholder="Заголовок для пошукової видачі"
                    invalid={showErrors && errors.seoTitle}
                />

                <div className={hintClass}>
                    <span>Рекомендовано 30–60 символів</span>

                    <span className={errors.seoTitle ? "text-[var(--error-primary)]" : ""}>
                        {text.seoTitle.trim().length} / {SEO_TITLE_MAX}
                    </span>
                </div>
            </div>

            <div className="mt-5">
                <label className={labelClass}>SEO-опис</label>

                <Textarea
                    value={text.seoDescription}
                    onChange={(event) =>
                        update({ seoDescription: event.target.value })
                    }
                    placeholder="Опис для пошукової видачі"
                    rows={3}
                    invalid={showErrors && errors.seoDescription}
                />

                <div className={hintClass}>
                    <span>Рекомендовано 120–160 символів</span>

                    <span className={errors.seoDescription ? "text-[var(--error-primary)]" : ""}>
                        {text.seoDescription.trim().length} / {SEO_DESCRIPTION_MAX}
                    </span>
                </div>
            </div>
        </div>
    );
}
