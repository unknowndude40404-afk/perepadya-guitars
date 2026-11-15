import "server-only";

import type { PostStatus } from "@/entities/post";
import { supabaseServer } from "@/shared/lib/supabase/server";

import { ADMIN_POSTS_PAGE_SIZE } from "../config/posts.config";
import type { AdminPostsQuery } from "../lib/posts-url";

export type AdminPostListItem = {
    id: string;
    title: string;
    slug: string;
    status: PostStatus;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

type GetAdminPostsResult =
    | {
        success: true;
        posts: AdminPostListItem[];
        total: number;
    }
    | {
        success: false;
        reason: string;
    };

type RpcResult = {
    total: number;
    items: AdminPostListItem[];
};

export async function getAdminPosts(
    query: AdminPostsQuery,
): Promise<GetAdminPostsResult> {
    const { data, error } = await supabaseServer.rpc("get_admin_posts", {
        p_search: query.search || null,
        p_status: query.status === "all" ? null : query.status,
        p_sort_field: query.sortField,
        p_sort_dir: query.sortDirection,
        p_limit: ADMIN_POSTS_PAGE_SIZE,
        p_offset: (query.page - 1) * ADMIN_POSTS_PAGE_SIZE,
    });

    if (error) {
        console.error("ADMIN POSTS LOOKUP ERROR", error);

        return {
            success: false,
            reason: "posts_lookup_failed",
        };
    }

    const result = data as RpcResult;

    return {
        success: true,
        total: result.total ?? 0,
        posts: result.items ?? [],
    };
}
