import { getDictionary } from "@/shared/i18n";

export function cleanLlmsText(text: string): string {
    const clean = text
        .replace(/\s*[✈➤✔]\s*/g, ". ")
        .replace(/\s+/g, " ")
        .trim();

    return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

export function cleanLlmsLinkText(text: string): string {
    return text.replace(/[\[\]]/g, "").trim();
}

const LLMS_DICTIONARY = getDictionary("en");

export const LLMS_TITLE = LLMS_DICTIONARY.site.title;

export const LLMS_SUMMARY = cleanLlmsText(LLMS_DICTIONARY.site.description);
