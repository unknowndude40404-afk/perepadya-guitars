import type { FaqItem, PostBlock, PostBlockType } from "../model/blocks";

function createId() {
    return crypto.randomUUID();
}

export function createFaqItem(): FaqItem {
    return {
        id: createId(),
        question: "",
        answer: "",
    };
}

export function createPostBlock(type: PostBlockType): PostBlock {
    const id = createId();

    switch (type) {
        case "text":
            return {
                id,
                type,
                content: { type: "doc", content: [{ type: "paragraph" }] },
            };

        case "image":
            return { id, type, url: "", alt: "", width: null, height: null };

        case "callout":
            return { id, type, variant: "info", text: "" };

        case "cta":
            return { id, type, title: "", text: "", buttonLabel: "" };

        case "faq":
            return { id, type, items: [createFaqItem()] };
    }
}