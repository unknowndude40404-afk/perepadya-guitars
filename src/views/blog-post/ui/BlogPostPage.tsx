import { notFound } from "next/navigation";

import { LOCALE_META, localizePath } from "@/shared/i18n";
import { getI18n } from "@/shared/i18n/server";
import { formatDate } from "@/shared/lib/format";
import {
    Breadcrumbs,
    BreadcrumbsJsonLd,
    type BreadcrumbItem,
} from "@/shared/ui/breadcrumbs";

import { getPublishedPost } from "../api/get-published-post";
import { PostBlocks } from "./blocks/PostBlocks";
import { PostJsonLd } from "./PostJsonLd";

type BlogPostPageProps = {
    slug: string;
};

export async function BlogPostPage({ slug }: BlogPostPageProps) {
    const { locale, dict } = await getI18n();
    const post = await getPublishedPost(slug, locale);

    if (!post) {
        notFound();
    }

    const breadcrumbs: BreadcrumbItem[] = [
        { label: dict.nav.home, href: localizePath(locale, "/") },
        { label: dict.blog.title, href: localizePath(locale, "/blog") },
        { label: post.title, href: localizePath(locale, `/blog/${post.slug}`) },
    ];

    return (
        <section className="flex w-full flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8">
            <article className="flex w-full flex-col gap-[20px] sm:gap-[24px]">
                <BreadcrumbsJsonLd items={breadcrumbs} />
                <PostJsonLd post={post} locale={locale} />

                <div className="flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[8px]">
                    <Breadcrumbs items={breadcrumbs} />

                    {post.publishedAt ? (
                        <time
                            dateTime={post.publishedAt}
                            className="shrink-0 text-[14px] text-[var(--text-secondary)]"
                        >
                            {formatDate(post.publishedAt, LOCALE_META[locale].dateLocale)}
                        </time>
                    ) : null}
                </div>

                <h1 className="text-[32px] font-bold leading-tight text-[var(--text-primary)] max-[576px]:text-[26px]">
                    {post.title}
                </h1>

                <PostBlocks blocks={post.blocks} />
            </article>
        </section>
    );
}