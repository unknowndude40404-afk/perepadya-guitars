import type { ProductStatus } from "@/entities/product/config/status.config";
import { supabaseServer } from "@/shared/lib/supabase/server";

import { ADMIN_PRODUCTS_PAGE_SIZE } from "../config/products.config";
import type { AdminProductsQuery } from "../lib/products-url";

export type AdminProductListItem = {
    id: string;
    name: string;
    slug: string;
    isHidden: boolean;
    image: string | null;
    status: ProductStatus;
};

type GetAdminProductsResult =
    | {
        success: true;
        products: AdminProductListItem[];
        total: number;
    }
    | {
        success: false;
        reason: string;
    };

type RpcResult = {
    success: boolean;
    total: number;
    items: AdminProductListItem[];
};

export async function getAdminProducts(
    query: AdminProductsQuery,
): Promise<GetAdminProductsResult> {
    const offset =
        (query.page - 1) * ADMIN_PRODUCTS_PAGE_SIZE;

    const { data, error } = await supabaseServer.rpc(
        "get_admin_products",
        {
            p_search: query.search || null,
            p_sort: query.sort,
            p_limit: ADMIN_PRODUCTS_PAGE_SIZE,
            p_offset: offset,
            p_show_hidden: query.showHidden,
        },
    );

    if (error) {
        console.error(
            "ADMIN PRODUCTS RPC ERROR",
            error,
        );

        return {
            success: false,
            reason: "products_lookup_failed",
        };
    }

    const result = data as RpcResult;

    return {
        success: true,
        products: result.items,
        total: result.total,
    };
}