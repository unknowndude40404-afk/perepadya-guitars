import "server-only";

import { isLocale, type Locale } from "@/shared/i18n/config";
import { supabaseServer } from "@/shared/lib/supabase/server";

export type SitemapPost = {
    slug: string;
    updatedAt: string;
    locales: Locale[];
};

export async function getSitemapPosts(): Promise<SitemapPost[]> {
    const { data, error } = await supabaseServer
        .from("posts")
        .select("slug, updated_at, translations:post_translations ( locale )")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (error) {
        throw new Error(`GET SITEMAP POSTS ERROR: ${error.message}`);
    }

    return (data ?? []).map((row) => ({
        slug: row.slug as string,
        updatedAt: row.updated_at as string,
        locales: ((row.translations ?? []) as { locale: string }[])
            .map((item) => item.locale)
            .filter(isLocale),
    }));
}
