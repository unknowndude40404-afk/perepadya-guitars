import "server-only";

import { supabaseServer } from "@/shared/lib/supabase/server";

import {
    POST_IMAGES_BUCKET,
    POST_IMAGE_EXTENSIONS,
    type PostImageType,
} from "../config/images.config";

type CreatePostImageUploadResult =
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

export async function createPostImageUpload(
    type: PostImageType,
): Promise<CreatePostImageUploadResult> {
    const path = `posts/${crypto.randomUUID()}.${POST_IMAGE_EXTENSIONS[type]}`;

    const { data, error } = await supabaseServer.storage
        .from(POST_IMAGES_BUCKET)
        .createSignedUploadUrl(path);

    if (error || !data) {
        console.error("CREATE POST IMAGE UPLOAD URL ERROR", error?.message);

        return { success: false, reason: "upload_url_failed" };
    }

    const { data: publicData } = supabaseServer.storage
        .from(POST_IMAGES_BUCKET)
        .getPublicUrl(path);

    return {
        success: true,
        path: data.path,
        token: data.token,
        publicUrl: publicData.publicUrl,
    };
}

function toStoragePath(url: string): string | null {
    const marker = `/object/public/${POST_IMAGES_BUCKET}/`;

    const index = url.indexOf(marker);

    return index === -1 ? null : url.slice(index + marker.length);
}

export async function deletePostImages(urls: string[]) {
    const paths = urls
        .map(toStoragePath)
        .filter((path): path is string => Boolean(path));

    if (!paths.length) {
        return;
    }

    const { error } = await supabaseServer.storage
        .from(POST_IMAGES_BUCKET)
        .remove(paths);

    if (error) {
        console.error("DELETE POST IMAGES ERROR", error.message);
    }
}