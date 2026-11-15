import {
    PRODUCT_IMAGE_ERROR_MESSAGES,
    uploadProductImage,
    validateProductImage,
} from "@/entities/product/lib/upload-product-image";

export type ProductImageDraft =
    | {
        key: string;
        kind: "existing";
        url: string;
    }
    | {
        key: string;
        kind: "new";
        file: File;
        previewUrl: string;
    };

export const MAX_PRODUCT_IMAGES = 8;

export function toExistingImages(urls: string[]): ProductImageDraft[] {
    return urls.map((url) => ({
        key: url,
        kind: "existing",
        url,
    }));
}

export function createImageDraft(file: File): ProductImageDraft {
    return {
        key: crypto.randomUUID(),
        kind: "new",
        file,
        previewUrl: URL.createObjectURL(file),
    };
}

export function getImageSrc(image: ProductImageDraft) {
    return image.kind === "existing" ? image.url : image.previewUrl;
}

export function validateFile(file: File): string | null {
    const reason = validateProductImage(file);

    return reason ? PRODUCT_IMAGE_ERROR_MESSAGES[reason] : null;
}

type UploadNewImagesResult = {
    images: ProductImageDraft[];
    error: string | null;
};

export async function uploadNewImages(
    images: ProductImageDraft[],
): Promise<UploadNewImagesResult> {
    let error: string | null = null;

    const nextImages = await Promise.all(
        images.map(async (image): Promise<ProductImageDraft> => {
            if (image.kind === "existing") {
                return image;
            }

            const result = await uploadProductImage(image.file);

            if (!result.success) {
                error ??= PRODUCT_IMAGE_ERROR_MESSAGES[result.reason];

                return image;
            }

            URL.revokeObjectURL(image.previewUrl);

            return { key: image.key, kind: "existing", url: result.url };
        }),
    );

    return { images: nextImages, error };
}

export function getImageUrls(images: ProductImageDraft[]): string[] {
    return images.flatMap((image) =>
        image.kind === "existing" ? [image.url] : [],
    );
}