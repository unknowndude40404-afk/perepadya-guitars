import type { CalloutVariant, PostBlockType } from "../model/blocks";

export const POST_BLOCK_TYPES: PostBlockType[] = [
    "text",
    "image",
    "callout",
    "cta",
    "faq",
];

export const POST_BLOCK_LABELS: Record<PostBlockType, string> = {
    text: "Текст",
    image: "Зображення",
    callout: "Примітка",
    cta: "Кнопка на вітрину",
    faq: "Питання — відповідь",
};

export const CALLOUT_VARIANT_LABELS: Record<CalloutVariant, string> = {
    info: "Інформація",
    tip: "Порада",
    warning: "Увага",
};