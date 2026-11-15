import type { ProductStatus } from "@/entities/product/config/status.config";
import type { ProductTranslation } from "@/entities/product/model/product.types";
import { isLocale, type Locale } from "@/shared/i18n/config";
import { supabaseServer } from "@/shared/lib/supabase/server";

export type AdminProductDetails = {
    id: string;
    slug: string;
    isHidden: boolean;
    images: string[];
    sku: string;
    gtin: string | null;
    status: ProductStatus;
    translations: Partial<Record<Locale, ProductTranslation>>;
};

type GetAdminProductResult =
    | {
        success: true;
        product: AdminProductDetails;
    }
    | {
        success: false;
        reason: string;
    };

type RawProduct = Omit<AdminProductDetails, "images" | "translations"> & {
    images: string[] | null;
    translations: (ProductTranslation & { locale: string })[] | null;
};

export async function getAdminProduct(
    id: string,
): Promise<GetAdminProductResult> {
    const { data, error } = await supabaseServer
        .from("products")
        .select(
            `
                id,
                slug,
                isHidden,
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
            `,
        )
        .eq("id", id)
        .maybeSingle();

    if (error) {
        console.error("ADMIN PRODUCT ERROR", error);

        return {
            success: false,
            reason: error.code === "22P02" ? "product_not_found" : "product_lookup_failed",
        };
    }

    if (!data) {
        return {
            success: false,
            reason: "product_not_found",
        };
    }

    const raw = data as unknown as RawProduct;

    const translations: AdminProductDetails["translations"] = {};

    for (const item of raw.translations ?? []) {
        if (isLocale(item.locale)) {
            translations[item.locale] = {
                name: item.name,
                description: item.description,
                seoTitle: item.seoTitle,
                seoDescription: item.seoDescription,
            };
        }
    }

    return {
        success: true,

        product: {
            id: raw.id,
            slug: raw.slug,
            isHidden: raw.isHidden,
            images: raw.images ?? [],
            sku: raw.sku,
            gtin: raw.gtin,
            status: raw.status,
            translations,
        },
    };
}
