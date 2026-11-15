import type { Metadata } from "next";

import { SITE_NAME, SITE_URL } from "@/shared/config/site";

import { DEFAULT_LOCALE, LOCALE_META, LOCALES, type Locale } from "./config";
import type { Dictionary } from "./dictionaries";
import { localizePath } from "./path";

export function absoluteUrl(locale: Locale, path: string) {
    return `${SITE_URL}${localizePath(locale, path)}`;
}

type AlternatesOptions = {
    locale: Locale;
    path: string;
    availableLocales?: readonly Locale[];
};

export function getAlternates({
    locale,
    path,
    availableLocales = LOCALES,
}: AlternatesOptions): NonNullable<Metadata["alternates"]> {
    const isAvailable = availableLocales.includes(locale);

    if (!isAvailable) {
        return { canonical: absoluteUrl(DEFAULT_LOCALE, path) };
    }

    const languages: Record<string, string> = {};

    for (const item of availableLocales) {
        languages[LOCALE_META[item].htmlLang] = absoluteUrl(item, path);
    }

    if (availableLocales.includes(DEFAULT_LOCALE)) {
        languages["x-default"] = absoluteUrl(DEFAULT_LOCALE, path);
    }

    return {
        canonical: absoluteUrl(locale, path),
        languages,
    };
}

export function getBaseMetadata(locale: Locale, dict: Dictionary): Metadata {
    return {
        metadataBase: new URL(SITE_URL),

        title: {
            default: dict.site.title,
            template: `%s | ${SITE_NAME}`,
        },

        description: dict.site.description,

        alternates: getAlternates({ locale, path: "/" }),

        openGraph: {
            type: "website",
            locale: LOCALE_META[locale].ogLocale,
            siteName: SITE_NAME,
            title: dict.site.title,
            description: dict.site.description,
            url: absoluteUrl(locale, "/"),
            images: [
                {
                    url: "/images/og-image.jpeg",
                    width: 1200,
                    height: 630,
                    alt: dict.site.title,
                },
            ],
        },

        twitter: {
            card: "summary_large_image",
            title: dict.site.title,
            description: dict.site.description,
            images: ["/images/og-image.jpeg"],
        },

        robots: {
            index: true,
            follow: true,
        },
    };
}
