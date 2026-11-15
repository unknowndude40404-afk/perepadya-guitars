import type { Product } from "@/entities/product/model/product.types";
import type { Locale } from "@/shared/i18n";
import { supabaseServer } from "@/shared/lib/supabase/server";

import { parseCatalogSort } from "../config/catalog.config";

type GetCatalogPageDataParams = {
    search?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
    locale: Locale;
};

export type CatalogPageData = {
    data: Product[];
    total: number;
    page: number;
    pageSize: number;
};

export async function getCatalogPageData({
    search,
    sort,
    page = 1,
    pageSize = 16,
    locale,
}: GetCatalogPageDataParams): Promise<CatalogPageData> {
    const { data, error } =
        await supabaseServer.rpc(
            "get_catalog_page",
            {
                search_value:
                    search?.trim() || null,

                sort_value:
                    parseCatalogSort(sort).sort,

                page_value:
                    page,

                page_size_value:
                    pageSize,

                locale_value:
                    locale,
            },
        );

    if (error) {
        throw new Error(
            `getCatalogPageData: ${error.message}`,
        );
    }

    if (!data) {
        return {
            data: [],
            total: 0,
            page,
            pageSize,
        };
    }

    const result =
        data as CatalogPageData;

    return {
        data:
            result.data ?? [],

        total:
            result.total ?? 0,

        page:
            result.page ?? page,

        pageSize:
            result.pageSize ?? pageSize,
    };
}
