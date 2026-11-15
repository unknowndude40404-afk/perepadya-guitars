import type { JSONContent } from "@tiptap/react";

export type TextBlock = {
    id: string;
    type: "text";
    content: JSONContent;
};

export type ImageBlock = {
    id: string;
    type: "image";
    url: string;
    alt: string;
    width: number | null;
    height: number | null;
};

export type CalloutVariant = "info" | "tip" | "warning";

export type CalloutBlock = {
    id: string;
    type: "callout";
    variant: CalloutVariant;
    text: string;
};

export type CtaBlock = {
    id: string;
    type: "cta";
    title: string;
    text: string;
    buttonLabel: string;
};

export type FaqItem = {
    id: string;
    question: string;
    answer: string;
};

export type FaqBlock = {
    id: string;
    type: "faq";
    items: FaqItem[];
};

export type PostBlock =
    | TextBlock
    | ImageBlock
    | CalloutBlock
    | CtaBlock
    | FaqBlock;

export type PostBlockType = PostBlock["type"];