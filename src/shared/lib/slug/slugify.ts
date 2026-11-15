const CYRILLIC_MAP: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "h", ґ: "g", д: "d",
    е: "e", є: "ie", ж: "zh", з: "z", и: "y", і: "i",
    ї: "i", й: "i", к: "k", л: "l", м: "m", н: "n",
    о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
    ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "shch",
    ь: "", ю: "iu", я: "ia", ы: "y", э: "e", ъ: "",
};

const WORD_START_MAP: Record<string, string> = {
    є: "ye",
    ї: "yi",
    й: "y",
    ю: "yu",
    я: "ya",
};

const LETTER_OR_DIGIT = /[a-z0-9а-яґєії]/;

export function slugify(value: string): string {
    const chars = Array.from(
        value.toLowerCase().replace(/['’ʼ`]/g, ""),
    );

    return chars
        .map((char, index) => {
            const previous = chars[index - 1];
            const isWordStart = !previous || !LETTER_OR_DIGIT.test(previous);

            if (isWordStart && WORD_START_MAP[char]) {
                return WORD_START_MAP[char];
            }

            return CYRILLIC_MAP[char] ?? char;
        })
        .join("")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}