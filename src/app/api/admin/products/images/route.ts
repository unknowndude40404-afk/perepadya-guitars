import { NextResponse } from "next/server";

import { requireAdminApi } from "@/shared/lib/auth";
import { isProductImageType } from "@/entities/product/config/images.config";
import { createProductImageUpload } from "@/entities/product/api/upload-product-images";

export async function POST(request: Request) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const body = (await request.json()) as { contentType?: unknown };

        if (!isProductImageType(body.contentType)) {
            return NextResponse.json(
                { success: false, reason: "invalid_image_type" },
                { status: 400 },
            );
        }

        const result = await createProductImageUpload(body.contentType);

        if (!result.success) {
            return NextResponse.json(result, { status: 500 });
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error("PRODUCT IMAGE UPLOAD URL ROUTE ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}