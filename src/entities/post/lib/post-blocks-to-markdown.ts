import type { JSONContent } from "@tiptap/react";

import { CALLOUT_VARIANT_LABELS } from "../config/blocks.config";
import type { PostBlock } from "../model/blocks";

function inlineToMarkdown(nodes: JSONContent[] | undefined): string {
    return (nodes ?? [])
        .map((node) => {
            if (node.type === "text") {
                const text = node.text ?? "";
                const link = node.marks?.find((mark) => mark.type === "link");
                const href = link?.attrs?.href;

                return typeof href === "string" && href
                    ? `[${text}](${href})`
                    : text;
            }

            if (node.type === "hardBreak") {
                return "\n";
            }

            return inlineToMarkdown(node.content);
        })
        .join("");
}

function listItemToMarkdown(
    item: JSONContent,
    marker: string,
    depth: number,
    headingShift: number,
): string {
    const indent = "  ".repeat(depth);

    const parts = (item.content ?? [])
        .map((child) =>
            child.type === "bulletList" || child.type === "orderedList"
                ? nodeToMarkdown(child, depth + 1, headingShift)
                : inlineToMarkdown(child.content).trim(),
        )
        .filter(Boolean);

    const [first = "", ...rest] = parts;

    return [`${indent}${marker}${first}`, ...rest].join("\n");
}

function nodesToMarkdown(
    nodes: JSONContent[] | undefined,
    depth: number,
    headingShift: number,
): string {
    return (nodes ?? [])
        .map((node) => nodeToMarkdown(node, depth, headingShift))
        .filter(Boolean)
        .join("\n\n");
}

function nodeToMarkdown(
    node: JSONContent,
    depth: number,
    headingShift: number,
): string {
    switch (node.type) {
        case "heading": {
            const rawLevel =
                typeof node.attrs?.level === "number" ? node.attrs.level : 2;
            const level = Math.min(Math.max(rawLevel + headingShift, 1), 6);
            const text = inlineToMarkdown(node.content).trim();

            return text ? `${"#".repeat(level)} ${text}` : "";
        }

        case "paragraph":
            return inlineToMarkdown(node.content).trim();

        case "bulletList":
            return (node.content ?? [])
                .map((item) =>
                    listItemToMarkdown(item, "- ", depth, headingShift),
                )
                .join("\n");

        case "orderedList": {
            const start =
                typeof node.attrs?.start === "number" ? node.attrs.start : 1;

            return (node.content ?? [])
                .map((item, index) =>
                    listItemToMarkdown(
                        item,
                        `${start + index}. `,
                        depth,
                        headingShift,
                    ),
                )
                .join("\n");
        }

        case "blockquote": {
            const text = nodesToMarkdown(node.content, depth, headingShift);

            return text
                ? text
                    .split("\n")
                    .map((line) => `> ${line}`)
                    .join("\n")
                : "";
        }

        case "codeBlock": {
            const text = inlineToMarkdown(node.content);

            return text ? `\`\`\`\n${text}\n\`\`\`` : "";
        }

        case "horizontalRule":
            return "---";

        default:
            return nodesToMarkdown(node.content, depth, headingShift);
    }
}

function blockToMarkdown(block: PostBlock, headingShift: number): string {
    switch (block.type) {
        case "text":
            return nodeToMarkdown(block.content, 0, headingShift);

        case "image":
            return block.url
                ? `![${block.alt.replace(/[\[\]]/g, "")}](${block.url})`
                : "";

        case "callout": {
            const text = block.text.trim();

            return text
                ? `> **${CALLOUT_VARIANT_LABELS[block.variant]}:** ${text.replace(/\n/g, "\n> ")}`
                : "";
        }

        case "cta":
            return [
                block.title.trim() ? `**${block.title.trim()}**` : "",
                block.text.trim(),
            ]
                .filter(Boolean)
                .join("\n\n");

        case "faq":
            return block.items
                .filter((item) => item.question.trim() && item.answer.trim())
                .map(
                    (item) =>
                        `**${item.question.trim()}**\n\n${item.answer.trim()}`,
                )
                .join("\n\n");
    }
}

export function postBlocksToMarkdown(
    blocks: PostBlock[],
    headingShift = 0,
): string {
    return blocks
        .map((block) => blockToMarkdown(block, headingShift))
        .filter(Boolean)
        .join("\n\n");
}