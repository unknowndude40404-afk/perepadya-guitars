export const PRODUCT_IMAGES_BUCKET = "store-images";

export const PRODUCT_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

export const PRODUCT_IMAGE_EXTENSIONS = {
    "image/webp": "webp",
} as const;

export type ProductImageType = keyof typeof PRODUCT_IMAGE_EXTENSIONS;

export function isProductImageType(value: unknown): value is ProductImageType {
    return (
        typeof value === "string" &&
        Object.hasOwn(PRODUCT_IMAGE_EXTENSIONS, value)
    );
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const PRODUCT_IMAGE_URL_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/products/`;

export function isProductImageUrl(value: string): boolean {
    return (
        SUPABASE_URL !== "" &&
        value.startsWith(PRODUCT_IMAGE_URL_PREFIX) &&
        !value.includes("..")
    );
}