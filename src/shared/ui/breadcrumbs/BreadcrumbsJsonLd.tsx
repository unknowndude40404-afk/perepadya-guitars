import { SITE_URL } from "@/shared/config/site";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbsJsonLdProps = {
    items: BreadcrumbItem[];
};

export function BreadcrumbsJsonLd({
    items,
}: BreadcrumbsJsonLdProps) {
    if (items.length < 2) {
        return null;
    }

    const data = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",

        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,

            item: item.href
                ? `${SITE_URL}${item.href}`
                : undefined,
        })),
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