import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/shared/i18n/config";
import { slugify } from "@/shared/lib/slug/slugify";

import {
    isProductStatus,
    type ProductStatus,
} from "../config/status.config";
import type { ProductTranslation } from "../model/product.types";
import { sanitizeDescription } from "./sanitize-description";

export type ProductPayload = {
    slug: string;
    isHidden: boolean;
    images: string[];
    gtin: string | null;
    status: ProductStatus;
    translations: Partial<Record<Locale, ProductTranslation>>;
};

type ParseProductBodyResult =
    | {
        success: true;
        payload: ProductPayload;
    }
    | {
        success: false;
        reason: string;
    };

type UnknownRecord = Record<string, unknown>;

const NAME_MAX = 200;
const SEO_TITLE_MAX = 200;
const SEO_DESCRIPTION_MAX = 300;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown, maxLength: number) {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parseTranslations(
    value: unknown,
): Partial<Record<Locale, ProductTranslation>> | null {
    if (!isRecord(value)) {
        return null;
    }

    const result: Partial<Record<Locale, ProductTranslation>> = {};

    for (const [locale, item] of Object.entries(value)) {
        if (!isLocale(locale) || !isRecord(item)) {
            continue;
        }

        const name = toText(item.name, NAME_MAX);

        if (!name) {
            continue;
        }

        result[locale] = {
            name,
            description:
                typeof item.description === "string"
                    ? sanitizeDescription(item.description)
                    : null,
            seoTitle: toText(item.seoTitle, SEO_TITLE_MAX) || null,
            seoDescription: toText(item.seoDescription, SEO_DESCRIPTION_MAX) || null,
        };
    }

    return result;
}

export function parseProductBody(body: unknown): ParseProductBodyResult {
    if (!isRecord(body)) {
        return { success: false, reason: "invalid_input" };
    }

    const translations = parseTranslations(body.translations);
    const defaultName = translations?.[DEFAULT_LOCALE]?.name ?? "";
    const slug = slugify(defaultName);

    const images = Array.isArray(body.images)
        ? body.images.filter(
            (item): item is string => typeof item === "string" && Boolean(item),
        )
        : [];

    const gtin =
        typeof body.gtin === "string"
            ? body.gtin.trim() || null
            : null;

    const hasAllLocales = LOCALES.every(
        (locale) =>
            Boolean(translations?.[locale]?.name) &&
            Boolean(translations?.[locale]?.description) &&
            Boolean(translations?.[locale]?.seoTitle) &&
            Boolean(translations?.[locale]?.seoDescription),
    );

    if (
        !translations ||
        !hasAllLocales ||
        !defaultName ||
        !slug ||
        !isProductStatus(body.status)
    ) {
        return { success: false, reason: "invalid_input" };
    }

    return {
        success: true,

        payload: {
            slug,
            isHidden: body.isHidden === true,
            images,
            gtin,
            status: body.status,
            translations,
        },
    };
}
