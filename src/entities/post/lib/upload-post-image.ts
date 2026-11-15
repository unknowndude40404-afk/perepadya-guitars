import { uploadViaSignedUrl } from "@/shared/lib/storage/upload-via-signed-url";

import {
    POST_IMAGES_BUCKET,
    POST_IMAGE_MAX_SIZE,
    isPostImageType,
} from "../config/images.config";

export type UploadPostImageFailReason =
    | "invalid_image_type"
    | "image_too_large"
    | "upload_url_failed"
    | "upload_failed";

export const POST_IMAGE_ERROR_MESSAGES: Record<UploadPostImageFailReason, string> = {
    invalid_image_type: "Підтримується лише формат WEBP",
    image_too_large: "Файл більший за 5 МБ",
    upload_url_failed: "Не вдалося підготувати завантаження",
    upload_failed: "Не вдалося завантажити зображення",
};

export function validatePostImage(file: File): UploadPostImageFailReason | null {
    if (!isPostImageType(file.type)) {
        return "invalid_image_type";
    }

    if (file.size > POST_IMAGE_MAX_SIZE) {
        return "image_too_large";
    }

    return null;
}

export async function uploadPostImage(
    file: File,
): Promise<
    | { success: true; url: string }
    | { success: false; reason: UploadPostImageFailReason }
> {
    const invalidReason = validatePostImage(file);

    if (invalidReason) {
        return { success: false, reason: invalidReason };
    }

    return uploadViaSignedUrl({
        file,
        bucket: POST_IMAGES_BUCKET,
        uploadUrlEndpoint: "/api/admin/posts/images",
    });
}