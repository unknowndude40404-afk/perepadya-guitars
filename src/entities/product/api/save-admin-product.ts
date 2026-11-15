import "server-only";

import { supabaseServer } from "@/shared/lib/supabase/server";

import { isProductImageUrl } from "../config/images.config";
import { parseProductBody } from "../lib/parse-product-body";

import { deleteProductImages } from "./upload-product-images";

type SaveAdminProductResult =
    | {
        success: true;
        id: string;
    }
    | {
        success: false;
        reason: string;
    };

type RpcResult = {
    success: boolean;
    id?: string;
    reason?: string;
};

const STATUS_BY_REASON: Record<string, number> = {
    invalid_input: 400,
    invalid_images: 400,
    product_not_found: 404,
    slug_taken: 409,
    save_failed: 500,
};

export function getSaveAdminProductStatus(reason: string) {
    return STATUS_BY_REASON[reason] ?? 400;
}

async function getCurrentImages(productId: string) {
    const { data } = await supabaseServer
        .from("products")
        .select("images")
        .eq("id", productId)
        .maybeSingle();

    return (data?.images as string[] | null) ?? [];
}

export async function saveAdminProduct(
    productId: string | null,
    body: unknown,
): Promise<SaveAdminProductResult> {
    const parsed = parseProductBody(body);

    if (!parsed.success) {
        return {
            success: false,
            reason: parsed.reason,
        };
    }

    const images = parsed.payload.images;

    if (!images.every((url) => isProductImageUrl(url))) {
        return {
            success: false,
            reason: "invalid_images",
        };
    }

    const previousImages = productId
        ? await getCurrentImages(productId)
        : [];

    const { data, error } = await supabaseServer.rpc("save_admin_product", {
        p_product_id: productId,
        p_payload: parsed.payload,
    });

    if (error) {
        console.error("SAVE PRODUCT RPC ERROR", error.message);

        return {
            success: false,
            reason: "save_failed",
        };
    }

    const result = data as RpcResult;

    if (!result.success || !result.id) {
        return {
            success: false,
            reason: result.reason ?? "save_failed",
        };
    }

    const savedId = result.id;

    const { error: imagesError } = await supabaseServer
        .from("products")
        .update({ images })
        .eq("id", savedId);

    if (imagesError) {
        console.error("UPDATE PRODUCT IMAGES ERROR", imagesError.message);

        return {
            success: false,
            reason: "save_failed",
        };
    }

    const removed = previousImages.filter((url) => !images.includes(url));

    if (removed.length) {
        await deleteProductImages(removed);
    }

    return {
        success: true,
        id: savedId,
    };
}