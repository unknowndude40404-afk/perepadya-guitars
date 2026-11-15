import { supabaseServer } from "@/shared/lib/supabase/server";

import { isLocale, type Locale } from "@/shared/i18n";

export type SitemapProduct = {
    slug: string;
    updatedAt: string | null;
    locales: Locale[];
};

const BATCH_SIZE = 1000;

export async function getSitemapProducts(): Promise<SitemapProduct[]> {
    const products: SitemapProduct[] = [];

    let from = 0;

    while (true) {
        const { data, error } = await supabaseServer
            .from("products")
            .select(`slug, "updatedAt", translations:product_translations ( locale )`)
            .eq("isHidden", false)
            .order("createdAt", { ascending: true })
            .range(from, from + BATCH_SIZE - 1);

        if (error) {
            console.error(
                "SITEMAP PRODUCTS ERROR",
                error.message,
            );

            break;
        }

        const rows = data ?? [];

        products.push(
            ...rows.map((row) => ({
                slug: row.slug as string,
                updatedAt: (row.updatedAt as string) ?? null,
                locales: ((row.translations ?? []) as { locale: string }[])
                    .map((item) => item.locale)
                    .filter(isLocale),
            })),
        );

        if (rows.length < BATCH_SIZE) {
            break;
        }

        from += BATCH_SIZE;
    }

    return products;
}