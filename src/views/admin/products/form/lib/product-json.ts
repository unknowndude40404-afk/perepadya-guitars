import { z } from "zod";

import {
    PRODUCT_STATUSES,
    type ProductStatus,
} from "@/entities/product/config/status.config";
import { LOCALE_META, LOCALES } from "@/shared/i18n/config";

import {
    SEO_DESCRIPTION_MAX,
    SEO_TITLE_MAX,
    toProductTextsDraft,
    type ProductTextsDraft,
} from "../ui/product-texts/product-texts.lib";

/** Product fields that can be filled through JSON (images are uploaded manually). */
export type ProductFormData = {
    texts: ProductTextsDraft;
    status: ProductStatus;
    gtin: string;
    isHidden: boolean;
};

const text = z.string().default("");

const translationSchema = z.strictObject({
    name: text,
    description: text,
    seoTitle: text,
    seoDescription: text,
});

export const productJsonSchema = z
    .strictObject({
        status: z.enum(PRODUCT_STATUSES).default("in_stock"),
        gtin: z.string().nullable().default(""),
        isHidden: z.boolean().default(false),
        translations: z
            .partialRecord(z.enum(LOCALES), translationSchema)
            .default({}),
    })
    .transform(
        (data): ProductFormData => ({
            texts: toProductTextsDraft(
                Object.fromEntries(
                    Object.entries(data.translations).map(([locale, item]) => [
                        locale,
                        item && {
                            name: item.name,
                            description: item.description || null,
                            seoTitle: item.seoTitle || null,
                            seoDescription: item.seoDescription || null,
                        },
                    ]),
                ),
            ),
            status: data.status,
            gtin: data.gtin ?? "",
            isHidden: data.isHidden,
        }),
    );

/** Form data → JSON shown in the editor (all locales, all fields). */
export function toProductJson(data: ProductFormData) {
    return {
        status: data.status,
        gtin: data.gtin,
        isHidden: data.isHidden,
        translations: Object.fromEntries(
            LOCALES.map((locale) => [locale, { ...data.texts[locale] }]),
        ),
    };
}

export function buildProductAiPrompt(json: string) {
    const languages = LOCALES.map(
        (locale) => `${locale} (${LOCALE_META[locale].nativeName})`,
    ).join(", ");

    return `Ти допомагаєш заповнити картку товару для сайту майстерні гітар Perepadya Guitars.

Поверни ТІЛЬКИ JSON у тому ж форматі, що нижче, без пояснень і без \`\`\`.

Правила:
- "translations" — тексти для кожної мови: ${languages}. Заповни всі мови, перекладай природно, не дослівно.
- "name" — назва товару. Англійська назва (en) стає адресою сторінки, тому вона має бути короткою й унікальною.
- "description" — опис у HTML. Дозволені теги: <p>, <br>, <strong>, <em>, <u>, <s>, <h3>, <ul>, <ol>, <li>, <table>, <thead>, <tbody>, <tr>, <th>, <td>.
- "seoTitle" — заголовок для Google, до ${SEO_TITLE_MAX} символів.
- "seoDescription" — опис для Google, до ${SEO_DESCRIPTION_MAX} символів.
- "status": "in_stock" (в наявності) або "on_order" (під замовлення).
- "gtin" — штрихкод, якщо є, інакше "".
- "isHidden": true — товар прихований з вітрини.
- Не вигадуй ціну — на сайті цін немає.

Ось інформація про товар:
[ОПИШИ ТОВАР ТУТ]

Поточний JSON:
${json}`;
}
