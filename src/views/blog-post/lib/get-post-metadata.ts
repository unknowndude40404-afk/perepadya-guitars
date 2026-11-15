import "server-only";

import type { Metadata } from "next";

import { SITE_NAME } from "@/shared/config/site";
import { LOCALE_META, type Locale } from "@/shared/i18n";
import { absoluteUrl, getAlternates } from "@/shared/i18n/metadata";
import { getPostImageUrls } from "@/entities/post/lib/get-post-image-urls";

import { getPublishedPost } from "../api/get-published-post";

const OG_IMAGE = "/images/og-image.jpeg";

export async function getPostMetadata(
    slug: string,
    locale: Locale,
): Promise<Metadata> {
    const post = await getPublishedPost(slug, locale);

    if (!post) {
        return {};
    }

    const title = post.seoTitle || post.title;
    const description = post.seoDescription || post.excerpt || undefined;
    const path = `/blog/${post.slug}`;
    const url = absoluteUrl(locale, path);
    const image = post.coverUrl ?? getPostImageUrls(post.blocks)[0] ?? OG_IMAGE;

    return {
        title,
        description,
        alternates: getAlternates({
            locale,
            path,
            availableLocales: post.locales,
        }),
        openGraph: {
            type: "article",
            url,
            title,
            description,
            siteName: SITE_NAME,
            locale: LOCALE_META[locale].ogLocale,
            publishedTime: post.publishedAt ?? undefined,
            modifiedTime: post.updatedAt,
            images: [{ url: image }],
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image],
        },
    };
}