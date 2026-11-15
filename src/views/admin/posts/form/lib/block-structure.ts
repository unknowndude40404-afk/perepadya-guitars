import type { JSONContent } from "@tiptap/react";

import type { FaqItem, PostBlock } from "@/entities/post";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/shared/i18n/config";

/**
 * Post blocks have one structure for all languages: the same blocks in the
 * same order with the same ids. Only the texts differ per language. The image
 * of an image block, the callout type and the number of FAQ questions are
 * shared too.
 */

type TextsWithBlocks = Record<Locale, { blocks: PostBlock[] }>;

const EMPTY_DOC: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

function hasText(node: JSONContent | undefined): boolean {
    if (!node) {
        return false;
    }

    if (node.type === "text" && node.text?.trim()) {
        return true;
    }

    return (node.content ?? []).some(hasText);
}

function emptyFaqItems(items: FaqItem[]): FaqItem[] {
    return items.map(({ id }) => ({ id, question: "", answer: "" }));
}

/** Same block with the shared parts kept and the language texts cleared. */
export function emptyBlockCopy(block: PostBlock): PostBlock {
    switch (block.type) {
        case "text":
            return { ...block, content: EMPTY_DOC };

        case "image":
            return { ...block, alt: "" };

        case "callout":
            return { ...block, text: "" };

        case "cta":
            return { ...block, title: "", text: "", buttonLabel: "" };

        case "faq":
            return { ...block, items: emptyFaqItems(block.items) };
    }
}

/** Language texts of `target` placed into the shared structure of `source`. */
function mergeBlock(source: PostBlock, target: PostBlock): PostBlock {
    if (source.type !== target.type) {
        return emptyBlockCopy(source);
    }

    switch (source.type) {
        case "image": {
            const own = target as typeof source;

            return { ...source, alt: own.alt };
        }

        case "callout": {
            const own = target as typeof source;

            return { ...source, text: own.text };
        }

        case "faq": {
            const own = target as typeof source;
            const byId = new Map(own.items.map((item) => [item.id, item]));

            return {
                ...source,
                items: source.items.map((item) => {
                    const ownItem = byId.get(item.id);

                    return {
                        id: item.id,
                        question: ownItem?.question ?? "",
                        answer: ownItem?.answer ?? "",
                    };
                }),
            };
        }

        default:
            return { ...target, id: source.id };
    }
}

/**
 * Rebuilds `target` (another language) to match `source`: blocks are matched
 * by id, new blocks come in empty, removed ones are dropped, order follows
 * `source`.
 */
export function syncBlockStructure(
    source: PostBlock[],
    target: PostBlock[],
): PostBlock[] {
    const byId = new Map(target.map((block) => [block.id, block]));

    return source.map((block) => {
        const own = byId.get(block.id);

        return own ? mergeBlock(block, own) : emptyBlockCopy(block);
    });
}

/**
 * Makes every language follow the default (English) structure. Blocks of
 * other languages are matched by position, so data saved before blocks were
 * shared keeps its texts.
 */
export function alignBlocksToDefault<T extends TextsWithBlocks>(texts: T): T {
    const source = texts[DEFAULT_LOCALE].blocks;
    const result = { ...texts };

    for (const locale of LOCALES) {
        if (locale === DEFAULT_LOCALE) {
            continue;
        }

        const own = texts[locale].blocks;
        const byPosition = source.map((block, index) => {
            const candidate = own[index];

            return candidate && candidate.type === block.type
                ? mergeBlock(block, { ...candidate, id: block.id } as PostBlock)
                : emptyBlockCopy(block);
        });

        result[locale] = { ...texts[locale], blocks: byPosition };
    }

    return result;
}

/** True when the language texts of the block are not filled in. */
export function isBlockEmpty(block: PostBlock): boolean {
    switch (block.type) {
        case "text":
            return !hasText(block.content);

        case "image":
            return !block.alt.trim();

        case "callout":
            return !block.text.trim();

        case "cta":
            return (
                !block.title.trim() ||
                !block.text.trim() ||
                !block.buttonLabel.trim()
            );

        case "faq":
            return (
                block.items.length === 0 ||
                block.items.some(
                    (item) => !item.question.trim() || !item.answer.trim(),
                )
            );
    }
}

/** Fills the empty blocks of `target` with the texts of the same blocks in `source`. */
export function fillEmptyBlocks(
    source: PostBlock[],
    target: PostBlock[],
): PostBlock[] {
    const byId = new Map(source.map((block) => [block.id, block]));

    return target.map((block) => {
        const from = byId.get(block.id);

        if (!from || !isBlockEmpty(block)) {
            return block;
        }

        return structuredClone(from);
    });
}
