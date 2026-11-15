export const LOCALES = [
    "en",
    "uk",
    "de",
    "fr",
    "it",
    "es",
    "pl",
    "ro",
    "nl",
    "tr",
    "pt",
    "hu",
    "cs",
] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type LocaleMeta = {
    nativeName: string;
    htmlLang: string;
    ogLocale: string;
    dateLocale: string;
};

export const LOCALE_META: Record<Locale, LocaleMeta> = {
    en: { nativeName: "English", htmlLang: "en", ogLocale: "en_US", dateLocale: "en-GB" },
    uk: { nativeName: "Українська", htmlLang: "uk", ogLocale: "uk_UA", dateLocale: "uk-UA" },
    pl: { nativeName: "Polski", htmlLang: "pl", ogLocale: "pl_PL", dateLocale: "pl-PL" },
    de: { nativeName: "Deutsch", htmlLang: "de", ogLocale: "de_DE", dateLocale: "de-DE" },
    fr: { nativeName: "Français", htmlLang: "fr", ogLocale: "fr_FR", dateLocale: "fr-FR" },
    it: { nativeName: "Italiano", htmlLang: "it", ogLocale: "it_IT", dateLocale: "it-IT" },
    es: { nativeName: "Español", htmlLang: "es", ogLocale: "es_ES", dateLocale: "es-ES" },
    ro: { nativeName: "Română", htmlLang: "ro", ogLocale: "ro_RO", dateLocale: "ro-RO" },
    nl: { nativeName: "Nederlands", htmlLang: "nl", ogLocale: "nl_NL", dateLocale: "nl-NL" },
    tr: { nativeName: "Türkçe", htmlLang: "tr", ogLocale: "tr_TR", dateLocale: "tr-TR" },
    pt: { nativeName: "Português", htmlLang: "pt", ogLocale: "pt_PT", dateLocale: "pt-PT" },
    hu: { nativeName: "Magyar", htmlLang: "hu", ogLocale: "hu_HU", dateLocale: "hu-HU" },
    cs: { nativeName: "Čeština", htmlLang: "cs", ogLocale: "cs_CZ", dateLocale: "cs-CZ" },
};

export function isLocale(value: unknown): value is Locale {
    return (
        typeof value === "string" &&
        (LOCALES as readonly string[]).includes(value)
    );
}
