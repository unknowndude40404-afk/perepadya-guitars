import "server-only";

import type { Locale } from "@/shared/i18n/config";
import { supabaseServer } from "@/shared/lib/supabase/server";

import { BLOG_PAGE_SIZE, type BlogQuery } from "../model/blog-query";

export type PublishedPostListItem = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverUrl: string | null;
    publishedAt: string;
};

export type PublishedPostsPage = {
    posts: PublishedPostListItem[];
    total: number;
};

type RpcResult = {
    total: number;
    items: PublishedPostListItem[];
};

export async function getPublishedPosts(
    query: BlogQuery,
    locale: Locale,
): Promise<PublishedPostsPage | null> {
    const { data, error } = await supabaseServer.rpc("get_blog_page", {
        p_locale: locale,
        p_search: query.q || null,
        p_sort: query.sort,
        p_limit: BLOG_PAGE_SIZE,
        p_offset: (query.page - 1) * BLOG_PAGE_SIZE,
    });

    if (error) {
        throw new Error(`GET PUBLISHED POSTS ERROR: ${error.message}`);
    }

    const result = data as RpcResult;

    if (query.page > 1 && result.items.length === 0) {
        return null;
    }

    return {
        posts: result.items ?? [],
        total: result.total ?? 0,
    };
}
