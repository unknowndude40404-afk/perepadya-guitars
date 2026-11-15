import { uploadViaSignedUrl } from "@/shared/lib/storage/upload-via-signed-url";

import {
    PRODUCT_IMAGES_BUCKET,
    PRODUCT_IMAGE_MAX_SIZE,
    isProductImageType,
} from "../config/images.config";

export type UploadProductImageFailReason =
    | "invalid_image_type"
    | "image_too_large"
    | "upload_url_failed"
    | "upload_failed";

export const PRODUCT_IMAGE_ERROR_MESSAGES: Record<
    UploadProductImageFailReason,
    string
> = {
    invalid_image_type: "Підтримується лише формат WEBP",
    image_too_large: "Файл більший за 5 МБ",
    upload_url_failed: "Не вдалося підготувати завантаження",
    upload_failed: "Не вдалося завантажити зображення",
};

export function validateProductImage(
    file: File,
): UploadProductImageFailReason | null {
    if (!isProductImageType(file.type)) {
        return "invalid_image_type";
    }

    if (file.size > PRODUCT_IMAGE_MAX_SIZE) {
        return "image_too_large";
    }

    return null;
}

export async function uploadProductImage(
    file: File,
): Promise<
    | { success: true; url: string }
    | { success: false; reason: UploadProductImageFailReason }
> {
    const invalidReason = validateProductImage(file);

    if (invalidReason) {
        return { success: false, reason: invalidReason };
    }

    return uploadViaSignedUrl({
        file,
        bucket: PRODUCT_IMAGES_BUCKET,
        uploadUrlEndpoint: "/api/admin/products/images",
    });
}