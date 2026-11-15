import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/shared/i18n/config";
import { slugify } from "@/shared/lib/slug/slugify";

export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

export type ProductTextDraft = {
    name: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
};

export type ProductTextsDraft = Record<Locale, ProductTextDraft>;

type StoredTranslation = {
    name: string;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
};

function emptyText(): ProductTextDraft {
    return { name: "", description: "", seoTitle: "", seoDescription: "" };
}

export function toProductTextsDraft(
    translations: Partial<Record<Locale, StoredTranslation>> = {},
): ProductTextsDraft {
    return Object.fromEntries(
        LOCALES.map((locale) => {
            const item = translations[locale];

            return [
                locale,
                item
                    ? {
                        name: item.name,
                        description: item.description ?? "",
                        seoTitle: item.seoTitle ?? "",
                        seoDescription: item.seoDescription ?? "",
                    }
                    : emptyText(),
            ];
        }),
    ) as ProductTextsDraft;
}

function isEmptyHtml(value: string) {
    return !value.replace(/<[^>]*>/g, "").trim();
}

export function hasAnyText(text: ProductTextDraft) {
    return Boolean(
        text.name.trim() ||
        !isEmptyHtml(text.description) ||
        text.seoTitle.trim() ||
        text.seoDescription.trim(),
    );
}

export type ProductTextErrors = {
    name: boolean;
    description: boolean;
    seoTitle: boolean;
    seoDescription: boolean;
};

export function getProductTextErrors(
    locale: Locale,
    text: ProductTextDraft,
): ProductTextErrors {
    return {
        name: !text.name.trim(),
        description: isEmptyHtml(text.description),
        seoTitle:
            !text.seoTitle.trim() || text.seoTitle.trim().length > SEO_TITLE_MAX,
        seoDescription:
            !text.seoDescription.trim() ||
            text.seoDescription.trim().length > SEO_DESCRIPTION_MAX,
    };
}

export function hasProductTextErrors(errors: ProductTextErrors) {
    return (
        errors.name ||
        errors.description ||
        errors.seoTitle ||
        errors.seoDescription
    );
}

export function getProductSlug(texts: ProductTextsDraft) {
    return slugify(texts[DEFAULT_LOCALE].name);
}

export function toTranslationsPayload(texts: ProductTextsDraft) {
    const result: Partial<Record<Locale, StoredTranslation>> = {};

    for (const locale of LOCALES) {
        const text = texts[locale];

        if (!text.name.trim()) {
            continue;
        }

        result[locale] = {
            name: text.name.trim(),
            description: isEmptyHtml(text.description) ? null : text.description,
            seoTitle: text.seoTitle.trim() || null,
            seoDescription: text.seoDescription.trim() || null,
        };
    }

    return result;
}
