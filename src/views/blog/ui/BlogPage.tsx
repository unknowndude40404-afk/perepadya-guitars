import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LOCALE_META, localizePath } from "@/shared/i18n";
import { getI18n } from "@/shared/i18n/server";
import { formatDate } from "@/shared/lib/format";
import {
  Breadcrumbs,
  BreadcrumbsJsonLd,
  type BreadcrumbItem,
} from "@/shared/ui/breadcrumbs";
import { Pagination } from "@/shared/ui/pagination";

import { getPublishedPosts } from "../api/get-published-posts";
import { BLOG_PAGE_SIZE, type BlogQuery } from "../model/blog-query";
import { BlogToolbar } from "./BlogToolbar";

type BlogPageProps = {
  query: BlogQuery;
};

export async function BlogPage({ query }: BlogPageProps) {
  const { locale, dict } = await getI18n();
  const result = await getPublishedPosts(query, locale);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: dict.nav.home, href: localizePath(locale, "/") },
    { label: dict.blog.title, href: localizePath(locale, "/blog") },
  ];

  if (!result) {
    notFound();
  }

  const { posts, total } = result;

  return (
    <section className="flex w-full flex-1 flex-col gap-[20px] px-4 py-6 sm:gap-[24px] sm:px-6 sm:py-8">
      <BreadcrumbsJsonLd items={breadcrumbs} />
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="text-[28px] font-bold text-[var(--text-primary)]">
        {dict.blog.title}
      </h1>

      <BlogToolbar q={query.q} sort={query.sort} />

      {posts.length === 0 ? (
        <p className="text-[16px] text-[var(--text-secondary)]">
          {query.q ? dict.blog.notFound : dict.blog.empty}
        </p>
      ) : (
        <>
          <ul className="flex flex-col gap-[12px]">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={localizePath(locale, `/blog/${post.slug}`)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] transition hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-primary)] sm:flex-row"
                >
                  {post.coverUrl ? (
                    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-[var(--bg-secondary)] sm:w-[320px]">
                      <Image
                        src={post.coverUrl}
                        alt=""
                        fill
                        sizes="(max-width: 639px) 100vw, 320px"
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                      />
                    </div>
                  ) : null}

                  <div className="flex min-w-0 flex-1 flex-col gap-[8px] p-[16px] sm:p-[20px]">
                    <h2 className="line-clamp-2 text-[20px] font-semibold text-[var(--text-primary)] transition group-hover:text-[var(--accent-text)]">
                      {post.title}
                    </h2>

                    {post.excerpt ? (
                      <p className="line-clamp-3 text-[15px] leading-6 text-[var(--text-secondary)]">
                        {post.excerpt}
                      </p>
                    ) : null}

                    <time
                      dateTime={post.publishedAt}
                      className="mt-auto self-end pt-[8px] text-[13px] text-[var(--text-secondary)]"
                    >
                      {formatDate(post.publishedAt, LOCALE_META[locale].dateLocale)}
                    </time>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            currentPage={query.page}
            totalItems={total}
            pageSize={BLOG_PAGE_SIZE}
            labels={dict.pagination}
          />
        </>
      )}
    </section>
  );
}