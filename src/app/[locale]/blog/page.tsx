import type { Metadata } from "next";

import { formatMessage } from "@/shared/i18n";
import { getAlternates } from "@/shared/i18n/metadata";
import { getI18n } from "@/shared/i18n/server";
import { BlogPage, buildBlogUrl, parseBlogQuery } from "@/views/blog";

type PageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
    searchParams,
}: PageProps): Promise<Metadata> {
    const { locale, dict } = await getI18n();
    const query = parseBlogQuery(await searchParams);

    const isFiltered = Boolean(query.q) || query.sort !== "newest";

    return {
        title:
            query.page > 1
                ? formatMessage(dict.blog.pageTitle, { page: query.page })
                : dict.blog.title,
        description: dict.blog.description,
        alternates: getAlternates({
            locale,
            path: buildBlogUrl({ q: "", sort: "newest", page: query.page }),
        }),
        robots: isFiltered ? { index: false, follow: true } : undefined,
    };
}

export default async function Page({ searchParams }: PageProps) {
    const query = parseBlogQuery(await searchParams);

    return <BlogPage query={query} />;
}
