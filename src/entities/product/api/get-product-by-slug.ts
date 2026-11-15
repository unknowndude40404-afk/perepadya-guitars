import { cache } from "react";

import { DEFAULT_LOCALE, isLocale, type Locale } from "@/shared/i18n";
import { supabaseServer } from "@/shared/lib/supabase/server";

import type { ProductStatus } from "../config/status.config";
import type { ProductDetails, ProductTranslation } from "../model/product.types";

type RawProduct = {
  id: string;
  slug: string;
  images: string[] | null;
  sku: string;
  gtin: string | null;
  status: ProductStatus;
  translations: (ProductTranslation & { locale: string })[] | null;
};

export const getProductBySlug = cache(
  async (slug: string, locale: Locale): Promise<ProductDetails | null> => {
    const { data, error } = await supabaseServer
      .from("products")
      .select(`
        id,
        slug,
        images,
        sku,
        gtin,
        status,
        translations:product_translations (
          locale,
          name,
          description,
          seoTitle,
          seoDescription
        )
      `)
      .eq("slug", slug)
      .eq("isHidden", false)
      .maybeSingle();

    if (error) {
      console.error("PRODUCT BY SLUG ERROR", error.message);

      return null;
    }

    if (!data) {
      return null;
    }

    const raw = data as unknown as RawProduct;
    const translations = raw.translations ?? [];

    const own = translations.find((item) => item.locale === locale);
    const fallback = translations.find((item) => item.locale === DEFAULT_LOCALE);
    const text = own ?? fallback ?? translations[0];

    if (!text) {
      return null;
    }

    return {
      id: raw.id,
      slug: raw.slug,
      images: raw.images ?? [],
      sku: raw.sku,
      gtin: raw.gtin,
      status: raw.status,
      name: text.name,
      description: text.description,
      seoTitle: text.seoTitle,
      seoDescription: text.seoDescription,
      locales: translations
        .map((item) => item.locale)
        .filter(isLocale),
      isFallback: !own,
    };
  },
);
