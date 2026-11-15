import { generateHTML, generateJSON } from "@tiptap/core";
import { z } from "zod";

import type { FaqItem, PostBlock, PostStatus } from "@/entities/post";
import { POST_TEXT_EXTENSIONS } from "@/entities/post/config/text-extensions";
import { LOCALE_META, LOCALES, type Locale } from "@/shared/i18n/config";

export const SEO_TITLE_MAX = 60;
export const SEO_DESCRIPTION_MAX = 160;

export type PostTextDraft = {
    title: string;
    blocks: PostBlock[];
    seoTitle: string;
    seoDescription: string;
};

export type PostTextsDraft = Record<Locale, PostTextDraft>;

/** Post fields that can be filled through JSON (the cover is uploaded manually). */
export type PostFormData = {
    texts: PostTextsDraft;
    status: PostStatus;
};

// ---------------------------------------------------------------------------
// JSON shape: blocks without ids, text blocks as HTML
// ---------------------------------------------------------------------------

const text = z.string().default("");

const blockSchema = z.discriminatedUnion("type", [
    z.strictObject({ type: z.literal("text"), html: text }),
    z.strictObject({ type: z.literal("image"), url: text, alt: text }),
    z.strictObject({
        type: z.literal("callout"),
        variant: z.enum(["info", "tip", "warning"]).default("info"),
        text,
    }),
    z.strictObject({
        type: z.literal("cta"),
        title: text,
        text,
        buttonLabel: text,
    }),
    z.strictObject({
        type: z.literal("faq"),
        items: z
            .array(z.strictObject({ question: text, answer: text }))
            .default([]),
    }),
]);

type BlockJson = z.infer<typeof blockSchema>;

const translationSchema = z.strictObject({
    title: text,
    seoTitle: text,
    seoDescription: text,
    blocks: z.array(blockSchema).default([]),
});

export const postJsonSchema = z.strictObject({
    status: z.enum(["published", "draft"]).default("published"),
    translations: z.partialRecord(z.enum(LOCALES), translationSchema).default({}),
});

export type PostJson = z.infer<typeof postJsonSchema>;

// ---------------------------------------------------------------------------
// Blocks ↔ JSON
// ---------------------------------------------------------------------------

function textToHtml(content: PostBlock & { type: "text" }) {
    try {
        return generateHTML(content.content, POST_TEXT_EXTENSIONS);
    } catch {
        return "";
    }
}

function blockToJson(block: PostBlock): BlockJson {
    switch (block.type) {
        case "text":
            return { type: "text", html: textToHtml(block) };

        case "image":
            return { type: "image", url: block.url, alt: block.alt };

        case "callout":
            return { type: "callout", variant: block.variant, text: block.text };

        case "cta":
            return {
                type: "cta",
                title: block.title,
                text: block.text,
                buttonLabel: block.buttonLabel,
            };

        case "faq":
            return {
                type: "faq",
                items: block.items.map(({ question, answer }) => ({
                    question,
                    answer,
                })),
            };
    }
}

/**
 * JSON block → form block. Reuses the id (and image size) of the block that
 * was at the same place, so pending uploads and editor state stay attached.
 */
function blockFromJson(item: BlockJson, previous?: PostBlock): PostBlock {
    const id =
        previous && previous.type === item.type
            ? previous.id
            : crypto.randomUUID();

    switch (item.type) {
        case "text":
            return {
                id,
                type: "text",
                content: item.html.trim()
                    ? generateJSON(item.html, POST_TEXT_EXTENSIONS)
                    : { type: "doc", content: [{ type: "paragraph" }] },
            };

        case "image": {
            const keepSize =
                previous?.type === "image" && previous.url === item.url;

            return {
                id,
                type: "image",
                url: item.url,
                alt: item.alt,
                width: keepSize ? previous.width : null,
                height: keepSize ? previous.height : null,
            };
        }

        case "callout":
            return { id, type: "callout", variant: item.variant, text: item.text };

        case "cta":
            return {
                id,
                type: "cta",
                title: item.title,
                text: item.text,
                buttonLabel: item.buttonLabel,
            };

        case "faq": {
            const previousItems: FaqItem[] =
                previous?.type === "faq" ? previous.items : [];

            return {
                id,
                type: "faq",
                items: item.items.map((faq, index) => ({
                    id: previousItems[index]?.id ?? crypto.randomUUID(),
                    question: faq.question,
                    answer: faq.answer,
                })),
            };
        }
    }
}

export function toPostJson(data: PostFormData) {
    return {
        status: data.status,
        translations: Object.fromEntries(
            LOCALES.map((locale) => {
                const item = data.texts[locale];

                return [
                    locale,
                    {
                        title: item.title,
                        seoTitle: item.seoTitle,
                        seoDescription: item.seoDescription,
                        blocks: item.blocks.map(blockToJson),
                    },
                ];
            }),
        ),
    };
}

/** JSON editor data → post texts, keeping block ids from `previous`. */
export function textsFromPostJson(
    data: PostJson,
    previous: PostTextsDraft,
): PostTextsDraft {
    return Object.fromEntries(
        LOCALES.map((locale) => {
            const item = data.translations[locale];
            const prevBlocks = previous[locale]?.blocks ?? [];

            return [
                locale,
                {
                    title: item?.title ?? "",
                    seoTitle: item?.seoTitle ?? "",
                    seoDescription: item?.seoDescription ?? "",
                    blocks: (item?.blocks ?? []).map((block, index) =>
                        blockFromJson(block, prevBlocks[index]),
                    ),
                },
            ];
        }),
    ) as PostTextsDraft;
}

export function buildPostAiPrompt(json: string) {
    const languages = LOCALES.map(
        (locale) => `${locale} (${LOCALE_META[locale].nativeName})`,
    ).join(", ");

    return `Ти допомагаєш написати статтю для блогу майстерні гітар Perepadya Guitars.

Поверни ТІЛЬКИ JSON у тому ж форматі, що нижче, без пояснень і без \`\`\`.

Правила:
- "translations" — статті для кожної мови: ${languages}. Заповни всі мови, перекладай природно, не дослівно.
- Блоки спільні для всіх мов: однакова кількість, порядок і типи блоків, як у "en". Різниться лише текст. Фото ("url") береться з "en".
- "title" — заголовок статті. Англійський заголовок (en) стає адресою сторінки, тому має бути унікальним.
- "seoTitle" — заголовок для Google, до ${SEO_TITLE_MAX} символів.
- "seoDescription" — опис для Google, до ${SEO_DESCRIPTION_MAX} символів.
- "status": "published" (опубліковано) або "draft" (чернетка).
- "blocks" — вміст статті по черзі. Типи блоків:
  - { "type": "text", "html": "<p>…</p>" } — текст у HTML. Дозволені теги: <p>, <h2>, <h3>, <strong>, <em>, <s>, <a href>, <ul>, <ol>, <li>, <blockquote>, <table>, <tr>, <th>, <td>.
  - { "type": "callout", "variant": "info" | "tip" | "warning", "text": "…" } — примітка, порада або попередження.
  - { "type": "cta", "title": "…", "text": "…", "buttonLabel": "…" } — заклик залишити заявку (кнопка веде на форму заявки).
  - { "type": "faq", "items": [{ "question": "…", "answer": "…" }] } — питання та відповіді.
  - { "type": "image", "url": "", "alt": "…" } — місце для фото: залиш "url" порожнім (фото завантажать вручну), "alt" — опис фото для кожної мови.

Тема статті:
[ОПИШИ ТЕМУ ТУТ]

Поточний JSON:
${json}`;
}
