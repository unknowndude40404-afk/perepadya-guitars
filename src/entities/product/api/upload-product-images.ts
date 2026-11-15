import "server-only";

import { supabaseServer } from "@/shared/lib/supabase/server";

import {
    PRODUCT_IMAGES_BUCKET,
    PRODUCT_IMAGE_EXTENSIONS,
    type ProductImageType,
} from "../config/images.config";

type CreateProductImageUploadResult =
    | {
        success: true;
        path: string;
        token: string;
        publicUrl: string;
    }
    | {
        success: false;
        reason: "upload_url_failed";
    };

export async function createProductImageUpload(
    type: ProductImageType,
): Promise<CreateProductImageUploadResult> {
    const path = `products/${crypto.randomUUID()}.${PRODUCT_IMAGE_EXTENSIONS[type]}`;

    const { data, error } = await supabaseServer.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .createSignedUploadUrl(path);

    if (error || !data) {
        console.error("CREATE PRODUCT IMAGE UPLOAD URL ERROR", error?.message);

        return { success: false, reason: "upload_url_failed" };
    }

    const { data: publicData } = supabaseServer.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .getPublicUrl(path);

    return {
        success: true,
        path: data.path,
        token: data.token,
        publicUrl: publicData.publicUrl,
    };
}

export async function deleteProductImages(urls: string[]) {
    const paths = urls
        .map((url) => {
            const marker = `/object/public/${PRODUCT_IMAGES_BUCKET}/`;

            const index = url.indexOf(marker);

            return index === -1 ? null : url.slice(index + marker.length);
        })
        .filter((path): path is string => Boolean(path));

    if (!paths.length) {
        return;
    }

    const { error } = await supabaseServer.storage
        .from(PRODUCT_IMAGES_BUCKET)
        .remove(paths);

    if (error) {
        console.error("DELETE IMAGES ERROR", error.message);
    }
}