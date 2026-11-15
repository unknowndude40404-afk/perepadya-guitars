import { descriptionToText } from "@/entities/product/lib/description-to-text";
import type { ProductDetails } from "@/entities/product/model/product.types";

import {
    SCHEMA,
} from "@/shared/config/site";
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from "@/shared/i18n";
import { absoluteUrl } from "@/shared/i18n/metadata";

type ProductJsonLdProps = {
    product: ProductDetails;
    locale: Locale;
};

export function ProductJsonLd({ product, locale }: ProductJsonLdProps) {
    const url = absoluteUrl(locale, `/product/${product.slug}`);

    const description =
        descriptionToText(product.description) || product.name;

    const data = {
        "@context": SCHEMA.context,
        "@type": "Product",

        name: product.name,

        description,

        image: product.images,

        url,

        inLanguage:
            LOCALE_META[product.isFallback ? DEFAULT_LOCALE : locale].htmlLang,

        ...(product.sku ? { sku: product.sku } : {}),

        ...(product.gtin ? { gtin: product.gtin } : {}),
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
