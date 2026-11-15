const ENTITIES: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": "\"",
    "&#39;": "'",
    "&#x27;": "'",
};

export function descriptionToText(html: string | null): string {
    if (!html) {
        return "";
    }

    const text = html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<li[^>]*>/gi, "- ")
        .replace(/<\/li>/gi, "\n")
        .replace(/<h3[^>]*>/gi, "\n**")
        .replace(/<\/h3>/gi, "**\n")
        .replace(/<\/(th|td)>/gi, " | ")
        .replace(/<\/tr>/gi, "\n")
        .replace(/<\/(p|ul|ol|table)>/gi, "\n\n")
        .replace(/<[^>]*>/g, "")
        .replace(
            /&(nbsp|amp|lt|gt|quot|#39|#x27);/g,
            (entity) => ENTITIES[entity] ?? entity,
        );

    return text
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}