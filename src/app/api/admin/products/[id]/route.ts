import {
    NextRequest,
    NextResponse,
} from "next/server";

import { requireAdminApi } from "@/shared/lib/auth";
import { supabaseServer } from "@/shared/lib/supabase/server";
import {
    getSaveAdminProductStatus,
    saveAdminProduct,
} from "@/entities/product/api/save-admin-product";
import { deleteProductImages } from "@/entities/product/api/upload-product-images";
import { revalidateSite } from "@/shared/lib/cache/revalidate-site";

type RouteContext = {
    params: Promise<{ id: string }>;
};

type DeleteResult = {
    success: boolean;
    reason?: string;
};

export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const { id } = await context.params;

        const payload = await request.json();

        const result = await saveAdminProduct(id, payload);

        if (!result.success) {
            return NextResponse.json(result, {
                status: getSaveAdminProductStatus(result.reason),
            });
        }

        revalidateSite();

        return NextResponse.json(result);
    } catch (error) {
        console.error("UPDATE PRODUCT ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    context: RouteContext,
) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const { id } = await context.params;

        const { data: product } = await supabaseServer
            .from("products")
            .select("images")
            .eq("id", id)
            .maybeSingle();

        const { data, error } = await supabaseServer.rpc(
            "delete_admin_product",
            {
                p_product_id: id,
            },
        );

        if (error) {
            console.error("DELETE PRODUCT RPC ERROR", error.message);

            return NextResponse.json(
                { success: false, reason: "delete_failed" },
                { status: 500 },
            );
        }

        const result = data as DeleteResult;

        if (!result.success) {
            return NextResponse.json(result, {
                status: result.reason === "product_not_found" ? 404 : 409,
            });
        }

        const images = (product?.images as string[] | null) ?? [];

        if (images.length) {
            await deleteProductImages(images);
        }

        revalidateSite();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE PRODUCT ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}