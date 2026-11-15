import "server-only";

import { cache } from "react";

import { POST_SELECT, toPost, type Post, type PostRow } from "@/entities/post";
import type { Locale } from "@/shared/i18n/config";
import { supabaseServer } from "@/shared/lib/supabase/server";

export const getPublishedPost = cache(
    async (slug: string, locale: Locale): Promise<Post | null> => {
        const { data, error } = await supabaseServer
            .from("posts")
            .select(POST_SELECT)
            .eq("slug", slug)
            .eq("status", "published")
            .maybeSingle();

        if (error) {
            throw new Error(`GET PUBLISHED POST ERROR: ${error.message}`);
        }

        return data ? toPost(data as unknown as PostRow, locale) : null;
    },
);
