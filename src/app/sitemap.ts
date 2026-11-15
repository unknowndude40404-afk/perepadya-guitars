import type { MetadataRoute } from "next";

import { getSitemapPosts, type SitemapPost } from "@/entities/post/api/get-sitemap-posts";
import { getSitemapProducts } from "@/entities/product/api/get-sitemap-products";
import { DEFAULT_LOCALE, LOCALE_META, LOCALES, type Locale } from "@/shared/i18n";
import { absoluteUrl } from "@/shared/i18n/metadata";

export const revalidate = 86400;

type Entry = MetadataRoute.Sitemap[number];

async function loadSitemapPosts(): Promise<SitemapPost[]> {
    try {
        return await getSitemapPosts();
    } catch (error) {
        console.error("SITEMAP POSTS ERROR", error);

        return [];
    }
}

/**
 * One <url> per available locale, each listing all language versions
 * (hreflang) including x-default → English.
 */
function localizedEntries(
    path: string,
    availableLocales: readonly Locale[],
    options: Omit<Entry, "url" | "alternates">,
): Entry[] {
    const locales = availableLocales.length ? availableLocales : [DEFAULT_LOCALE];

    const languages: Record<string, string> = {};

    for (const locale of locales) {
        languages[LOCALE_META[locale].htmlLang] = absoluteUrl(locale, path);
    }

    if (locales.includes(DEFAULT_LOCALE)) {
        languages["x-default"] = absoluteUrl(DEFAULT_LOCALE, path);
    }

    return locales.map((locale) => ({
        ...options,
        url: absoluteUrl(locale, path),
        alternates: { languages },
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [products, posts] = await Promise.all([
        getSitemapProducts(),
        loadSitemapPosts(),
    ]);

    const staticPages = [
        { path: "/", changeFrequency: "daily", priority: 1 },
        { path: "/catalog", changeFrequency: "daily", priority: 0.9 },
        { path: "/blog", changeFrequency: "weekly", priority: 0.5 },
        { path: "/about", changeFrequency: "monthly", priority: 0.4 },
        { path: "/order", changeFrequency: "monthly", priority: 0.4 },
    ] as const;

    return [
        ...staticPages.flatMap((page) =>
            localizedEntries(page.path, LOCALES, {
                changeFrequency: page.changeFrequency,
                priority: page.priority,
            }),
        ),

        ...products.flatMap((product) =>
            localizedEntries(`/product/${product.slug}`, product.locales, {
                lastModified: product.updatedAt
                    ? new Date(product.updatedAt)
                    : undefined,
                changeFrequency: "weekly",
                priority: 0.7,
            }),
        ),

        ...posts.flatMap((post) =>
            localizedEntries(`/blog/${post.slug}`, post.locales, {
                lastModified: new Date(post.updatedAt),
                changeFrequency: "monthly",
                priority: 0.5,
            }),
        ),
    ];
}
