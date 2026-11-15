import sanitizeHtml from "sanitize-html";

export function sanitizeDescription(value: string): string | null {
    const clean = sanitizeHtml(value, {
        allowedTags: [
            "p",
            "br",
            "strong",
            "b",
            "em",
            "i",
            "u",
            "s",
            "h3",
            "ul",
            "ol",
            "li",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td",
        ],

        allowedAttributes: {
            th: ["colspan", "rowspan"],
            td: ["colspan", "rowspan"],
        },

        disallowedTagsMode: "discard",
    });

    const text = clean
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .trim();

    return text ? clean : null;
}