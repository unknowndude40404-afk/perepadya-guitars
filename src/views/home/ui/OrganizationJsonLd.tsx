import {
    SITE_NAME,
    SITE_SOCIALS,
    SITE_URL,
} from "@/shared/config/site";
import { LOCALE_META } from "@/shared/i18n";
import { absoluteUrl } from "@/shared/i18n/metadata";
import { getI18n } from "@/shared/i18n/server";

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

export async function OrganizationJsonLd() {
    const { locale, dict } = await getI18n();

    const socials = SITE_SOCIALS.map((social) => social.href).filter(Boolean);

    const organization = {
        "@type": "Organization",
        "@id": ORGANIZATION_ID,

        name: SITE_NAME,
        description: dict.site.description,
        url: SITE_URL,

        logo: `${SITE_URL}/images/logo.png`,
        image: `${SITE_URL}/images/og-image.jpeg`,

        ...(socials.length ? { sameAs: socials } : {}),
    };

    const website = {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        url: absoluteUrl(locale, "/"),
        inLanguage: LOCALE_META[locale].htmlLang,
        publisher: { "@id": ORGANIZATION_ID },
    };

    const data = {
        "@context": "https://schema.org",
        "@graph": [organization, website],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, "\\u003c"),
            }}
        />
    );
}