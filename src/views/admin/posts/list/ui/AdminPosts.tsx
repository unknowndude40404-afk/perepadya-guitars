import Image from "next/image";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/shared/ui/button-link";
import { Pagination } from "@/shared/ui/pagination";

import { getAdminPosts } from "../api/get-admin-posts";
import { ADMIN_POSTS_PAGE_SIZE } from "../config/posts.config";
import { parseAdminPostsQuery } from "../lib/posts-url";
import { PostsTable } from "./PostsTable";
import { PostsToolbar } from "./PostsToolbar";

type AdminPostsSearchParams = Record<string, string | string[] | undefined>;

type AdminPostsProps = {
    searchParams: AdminPostsSearchParams;
};

function getAdminPostsPageUrl(
    searchParams: AdminPostsSearchParams,
    page: number,
) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        if (key === "page" || value === undefined) {
            continue;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => params.append(key, item));
        } else {
            params.set(key, value);
        }
    }

    if (page > 1) {
        params.set("page", String(page));
    }

    const queryString = params.toString();

    return queryString ? `/admin/posts?${queryString}` : "/admin/posts";
}

export async function AdminPosts({ searchParams }: AdminPostsProps) {
    const query = parseAdminPostsQuery(searchParams);

    const result = await getAdminPosts(query);

    if (!result.success) {
        return (
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 text-sm text-[var(--error-primary)]">
                Не вдалося завантажити пости
            </div>
        );
    }

    const totalPages = Math.max(
        1,
        Math.ceil(result.total / ADMIN_POSTS_PAGE_SIZE),
    );

    if (query.page > totalPages) {
        redirect(getAdminPostsPageUrl(searchParams, totalPages));
    }

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                    Пости
                </h1>

                <span className="text-sm text-[var(--text-secondary)]">
                    Знайдено: {result.total}
                </span>
            </div>

            <PostsToolbar
                search={query.search}
                sortField={query.sortField}
                sortDirection={query.sortDirection}
                status={query.status}
            />

            <div className="mt-6">
                <PostsTable posts={result.posts} />
            </div>

            <Pagination
                currentPage={query.page}
                totalItems={result.total}
                pageSize={ADMIN_POSTS_PAGE_SIZE}
            />

            <ButtonLink
                href="/admin/posts/new"
                aria-label="Додати пост"
                title="Додати пост"
                className="fixed bottom-8 right-8 z-30 size-14 rounded-full bg-[var(--accent-primary)] shadow-[0_8px_24px_rgba(184,188,196,0.25)] hover:bg-[var(--accent-hover)] active:scale-95"
            >
                <Image src="/icons/plus.svg" alt="" width={24} height={24} className="brightness-0" />
            </ButtonLink>
        </div>
    );
}