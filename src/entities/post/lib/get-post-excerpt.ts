import type { JSONContent } from "@tiptap/react";

import type { PostBlock } from "../model/blocks";

const EXCERPT_LENGTH = 160;

function collectText(node: JSONContent, parts: string[]) {
    if (node.type === "heading") {
        return;
    }

    if (node.type === "paragraph") {
        const inline: string[] = [];

        for (const child of node.content ?? []) {
            if (child.type === "text" && typeof child.text === "string") {
                inline.push(child.text);
            } else if (child.type === "hardBreak") {
                inline.push(" ");
            }
        }

        parts.push(inline.join(""));

        return;
    }

    for (const child of node.content ?? []) {
        collectText(child, parts);
    }
}

function normalize(text: string) {
    return text.replace(/\s+/g, " ").trim();
}

function truncate(text: string, maxLength: number) {
    if (text.length <= maxLength) {
        return text;
    }

    const cut = text.slice(0, maxLength + 1);
    const lastSpace = cut.lastIndexOf(" ");

    const shortened =
        lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : text.slice(0, maxLength);

    return `${shortened.replace(/[\s,.;:!?—–-]+$/, "")}…`;
}

export function getPostExcerpt(blocks: PostBlock[]): string {
    const parts: string[] = [];

    for (const block of blocks) {
        if (block.type !== "text") {
            continue;
        }

        collectText(block.content, parts);

        if (normalize(parts.join(" ")).length >= EXCERPT_LENGTH) {
            break;
        }
    }

    return truncate(normalize(parts.join(" ")), EXCERPT_LENGTH);
}