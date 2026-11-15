import type { PostBlock } from "../model/blocks";
import { getPostImageUrls } from "./get-post-image-urls";

export function getPostFileUrls(
    blocks: PostBlock[],
    coverUrl: string | null,
): string[] {
    const urls = getPostImageUrls(blocks);

    return coverUrl ? [...new Set([...urls, coverUrl])] : urls;
}