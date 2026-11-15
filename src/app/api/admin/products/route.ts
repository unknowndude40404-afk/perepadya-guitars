import { NextResponse } from "next/server";

import { requireAdminApi } from "@/shared/lib/auth";
import {
    getSaveAdminProductStatus,
    saveAdminProduct,
} from "@/entities/product/api/save-admin-product";
import { revalidateSite } from "@/shared/lib/cache/revalidate-site";

export async function POST(request: Request) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const payload = await request.json();

        const result = await saveAdminProduct(null, payload);

        if (!result.success) {
            return NextResponse.json(result, {
                status: getSaveAdminProductStatus(result.reason),
            });
        }

        revalidateSite();

        return NextResponse.json(result);
    } catch (error) {
        console.error("CREATE PRODUCT ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}