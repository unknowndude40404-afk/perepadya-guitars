import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "./config";

export function pickLocaleFromAcceptLanguage(
    header: string | null | undefined,
): Locale {
    if (!header) {
        return DEFAULT_LOCALE;
    }

    const candidates = header
        .split(",")
        .map((part) => {
            const [tag, ...params] = part.trim().split(";");
            const qParam = params.find((param) => param.trim().startsWith("q="));
            const quality = qParam ? Number(qParam.trim().slice(2)) : 1;

            return {
                language: tag.trim().toLowerCase().split("-")[0],
                quality: Number.isFinite(quality) ? quality : 0,
            };
        })
        .filter((candidate) => candidate.language && candidate.quality > 0)
        .sort((a, b) => b.quality - a.quality);

    for (const candidate of candidates) {
        if (isLocale(candidate.language)) {
            return candidate.language;
        }
    }

    return (LOCALES as readonly string[]).includes(DEFAULT_LOCALE)
        ? DEFAULT_LOCALE
        : LOCALES[0];
}
