import "server-only";

import { DEFAULT_LOCALE } from "@/shared/i18n/config";
import { supabaseServer } from "@/shared/lib/supabase/server";

import { toPost } from "../lib/to-post";
import type { PostBlock } from "../model/blocks";
import { POST_SELECT, type PostRow } from "../model/types";

export type LlmsPost = {
    slug: string;
    title: string;
    publishedAt: string | null;
    blocks: PostBlock[];
};

export async function getLlmsPosts(): Promise<LlmsPost[]> {
    const { data, error } = await supabaseServer
        .from("posts")
        .select(POST_SELECT)
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (error) {
        throw new Error(`GET LLMS POSTS ERROR: ${error.message}`);
    }

    return ((data ?? []) as unknown as PostRow[]).flatMap((row) => {
        const post = toPost(row, DEFAULT_LOCALE);

        return post
            ? [{
                slug: post.slug,
                title: post.title,
                publishedAt: post.publishedAt,
                blocks: post.blocks,
            }]
            : [];
    });
}
