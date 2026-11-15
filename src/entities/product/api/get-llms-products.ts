import { supabaseServer } from "@/shared/lib/supabase/server";

import type { ProductStatus } from "../config/status.config";

export type LlmsProduct = {
    name: string;
    slug: string;
    description: string | null;
    seoDescription: string | null;
    status: ProductStatus;
};

type RawLlmsProduct = {
    slug: string;
    status: ProductStatus;
    translations:
        | {
            locale: string;
            name: string;
            description: string | null;
            seoDescription: string | null;
        }[]
        | null;
};

const BATCH_SIZE = 1000;

export async function getLlmsProducts(): Promise<LlmsProduct[]> {
    const products: LlmsProduct[] = [];

    let from = 0;

    while (true) {
        const { data, error } = await supabaseServer
            .from("products")
            .select(`
                slug,
                status,
                translations:product_translations ( locale, name, description, seoDescription )
            `)
            .eq("isHidden", false)
            .order("createdAt", { ascending: true })
            .range(from, from + BATCH_SIZE - 1);

        if (error) {
            console.error("LLMS PRODUCTS ERROR", error.message);

            break;
        }

        const rows = (data ?? []) as unknown as RawLlmsProduct[];

        for (const row of rows) {
            const text =
                row.translations?.find((item) => item.locale === "en") ??
                row.translations?.[0];

            if (!text) {
                continue;
            }

            products.push({
                slug: row.slug,
                status: row.status,
                name: text.name,
                description: text.description,
                seoDescription: text.seoDescription,
            });
        }

        if (rows.length < BATCH_SIZE) {
            break;
        }

        from += BATCH_SIZE;
    }

    return products;
}
