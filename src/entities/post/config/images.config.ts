export const POST_IMAGES_BUCKET = "post-images";

export const POST_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

export const POST_IMAGE_EXTENSIONS = {
    "image/webp": "webp",
} as const;

export type PostImageType = keyof typeof POST_IMAGE_EXTENSIONS;

export function isPostImageType(value: unknown): value is PostImageType {
    return (
        typeof value === "string" &&
        Object.hasOwn(POST_IMAGE_EXTENSIONS, value)
    );
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const POST_IMAGE_URL_PREFIX = `${SUPABASE_URL}/storage/v1/object/public/${POST_IMAGES_BUCKET}/posts/`;

export function isPostImageUrl(value: string): boolean {
    return (
        SUPABASE_URL !== "" &&
        value.startsWith(POST_IMAGE_URL_PREFIX) &&
        !value.includes("..")
    );
}