import type { PostBlock } from "../model/blocks";

export function getPostImageUrls(blocks: PostBlock[]): string[] {
    const urls: string[] = [];

    for (const block of blocks) {
        if (block.type === "image" && block.url) {
            urls.push(block.url);
        }
    }

    return urls;
}