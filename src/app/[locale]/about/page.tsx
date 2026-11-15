import type { Metadata } from "next";

import { SITE_NAME } from "@/shared/config/site";
import { absoluteUrl, getAlternates } from "@/shared/i18n/metadata";
import { getI18n } from "@/shared/i18n/server";

import { AboutPage } from "@/views/about";

export async function generateMetadata(): Promise<Metadata> {
    const { locale, dict } = await getI18n();

    return {
        title: dict.about.title,
        description: dict.about.description,
        alternates: getAlternates({ locale, path: "/about" }),
        openGraph: {
            type: "website",
            title: `${dict.about.title} | ${SITE_NAME}`,
            description: dict.about.description,
            url: absoluteUrl(locale, "/about"),
        },
    };
}

export default function AboutRoute() {
    return <AboutPage />;
}
