import type { JSONContent } from "@tiptap/react";

import { CALLOUT_VARIANT_LABELS } from "../config/blocks.config";
import { isPostImageUrl } from "../config/images.config";
import type { CalloutVariant, FaqItem, PostBlock } from "../model/blocks";

const MAX_BLOCKS = 100;
const MAX_FAQ_ITEMS = 30;
const MAX_TEXT_CONTENT_LENGTH = 200_000;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toText(value: unknown, maxLength: number): string {
    return typeof value === "string" ? value.slice(0, maxLength) : "";
}

function toDimension(value: unknown): number | null {
    return typeof value === "number" &&
        Number.isInteger(value) &&
        value > 0 &&
        value <= 20000
        ? value
        : null;
}

function isCalloutVariant(value: unknown): value is CalloutVariant {
    return (
        typeof value === "string" &&
        Object.hasOwn(CALLOUT_VARIANT_LABELS, value)
    );
}

function createIdFactory() {
    const used = new Set<string>();

    return (value: unknown): string => {
        const id =
            typeof value === "string" && value.length > 0 && value.length <= 64
                ? value
                : crypto.randomUUID();

        if (used.has(id)) {
            const freshId = crypto.randomUUID();

            used.add(freshId);

            return freshId;
        }

        used.add(id);

        return id;
    };
}

function parseFaqItems(
    value: unknown,
    takeId: (value: unknown) => string,
): FaqItem[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .slice(0, MAX_FAQ_ITEMS)
        .filter(isRecord)
        .map((item) => ({
            id: takeId(item.id),
            question: toText(item.question, 300),
            answer: toText(item.answer, 3000),
        }));
}

function parseBlock(
    value: unknown,
    takeId: (value: unknown) => string,
): PostBlock | null {
    if (!isRecord(value)) {
        return null;
    }

    switch (value.type) {
        case "text": {
            const content = value.content;

            if (!isRecord(content) || content.type !== "doc") {
                return null;
            }

            if (JSON.stringify(content).length > MAX_TEXT_CONTENT_LENGTH) {
                return null;
            }

            return {
                id: takeId(value.id),
                type: "text",
                content: content as JSONContent,
            };
        }

        case "image": {
            const url = toText(value.url, 2000);
            const width = toDimension(value.width);
            const height = toDimension(value.height);
            const hasSize = width !== null && height !== null;

            return {
                id: takeId(value.id),
                type: "image",
                url: isPostImageUrl(url) ? url : "",
                alt: toText(value.alt, 300),
                width: hasSize ? width : null,
                height: hasSize ? height : null,
            };
        }

        case "callout":
            return {
                id: takeId(value.id),
                type: "callout",
                variant: isCalloutVariant(value.variant) ? value.variant : "info",
                text: toText(value.text, 1000),
            };

        case "cta":
            return {
                id: takeId(value.id),
                type: "cta",
                title: toText(value.title, 200),
                text: toText(value.text, 500),
                buttonLabel: toText(value.buttonLabel, 60),
            };

        case "faq": {
            const items = parseFaqItems(value.items, takeId);

            if (items.length === 0) {
                return null;
            }

            return {
                id: takeId(value.id),
                type: "faq",
                items,
            };
        }

        default:
            return null;
    }
}

export function parsePostBlocks(value: unknown): PostBlock[] {
    if (!Array.isArray(value)) {
        return [];
    }

    const takeId = createIdFactory();

    return value
        .slice(0, MAX_BLOCKS)
        .map((block) => parseBlock(block, takeId))
        .filter((block): block is PostBlock => block !== null);
}