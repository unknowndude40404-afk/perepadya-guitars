import "server-only";

import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from "@/shared/i18n/config";
import { slugify } from "@/shared/lib/slug/slugify";
import { supabaseServer } from "@/shared/lib/supabase/server";

import type { PostStatus } from "../model/types";
import { isPostImageUrl } from "../config/images.config";
import { parsePostBlocks } from "../lib/parse-post-blocks";
import { getPostExcerpt } from "../lib/get-post-excerpt";
import { getPostFileUrls } from "../lib/get-post-file-urls";
import type { PostBlock } from "../model/blocks";
import { deletePostImages } from "./post-images";

export type SaveAdminPostPayload = {
    coverUrl?: unknown;
    status?: unknown;
    translations?: unknown;
};

type SaveAdminPostFailReason =
    | "invalid_fields"
    | "slug_taken"
    | "not_found"
    | "save_failed";

type SaveAdminPostResult =
    | { success: true; id: string }
    | { success: false; reason: SaveAdminPostFailReason };

const STATUS_CODES: Record<SaveAdminPostFailReason, number> = {
    invalid_fields: 400,
    slug_taken: 409,
    not_found: 404,
    save_failed: 500,
};

type ParsedTranslation = {
    title: string;
    excerpt: string | null;
    blocks: PostBlock[];
    seoTitle: string | null;
    seoDescription: string | null;
};

export function getSaveAdminPostStatus(reason: SaveAdminPostFailReason) {
    return STATUS_CODES[reason];
}

function toText(value: unknown, maxLength: number): string {
    return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function resolvePublishedAt(
    currentPublishedAt: string | null,
    status: PostStatus,
): string | null {
    if (status === "draft") {
        return null;
    }

    return currentPublishedAt ?? new Date().toISOString();
}

function parseTranslations(value: unknown) {
    const result: Partial<Record<Locale, ParsedTranslation>> = {};

    if (!isRecord(value)) {
        return result;
    }

    for (const [locale, item] of Object.entries(value)) {
        if (!isLocale(locale) || !isRecord(item)) {
            continue;
        }

        const title = toText(item.title, 200);

        if (!title) {
            continue;
        }

        const blocks = parsePostBlocks(item.blocks);

        result[locale] = {
            title,
            excerpt: getPostExcerpt(blocks) || null,
            blocks,
            seoTitle: toText(item.seoTitle, 200) || null,
            seoDescription: toText(item.seoDescription, 300) || null,
        };
    }

    return result;
}

function collectFileUrls(
    translations: Iterable<{ blocks: unknown }>,
    coverUrl: string | null,
) {
    const urls = new Set<string>();

    if (coverUrl) {
        urls.add(coverUrl);
    }

    for (const item of translations) {
        for (const url of getPostFileUrls(parsePostBlocks(item.blocks), null)) {
            urls.add(url);
        }
    }

    return urls;
}

export async function saveAdminPost(
    id: string | null,
    payload: SaveAdminPostPayload,
): Promise<SaveAdminPostResult> {
    const translations = parseTranslations(payload.translations);
    const defaultTitle = translations[DEFAULT_LOCALE]?.title ?? "";
    const slug = slugify(defaultTitle);

    const status: PostStatus =
        payload.status === "published" ? "published" : "draft";

    const coverUrlValue = toText(payload.coverUrl, 2000);
    const coverUrl = isPostImageUrl(coverUrlValue) ? coverUrlValue : null;

    const hasAllLocales = LOCALES.every((locale) => {
        const item = translations[locale];

        return Boolean(
            item?.title &&
            item.seoTitle &&
            item.seoDescription &&
            item.blocks.length > 0 &&
            item.blocks.every(
                (block) => block.type !== "image" || block.alt.trim(),
            ),
        );
    });

    if (!defaultTitle || !slug || !hasAllLocales) {
        return { success: false, reason: "invalid_fields" };
    }

    let currentPublishedAt: string | null = null;
    let previousFileUrls = new Set<string>();

    if (id) {
        const { data: current, error: currentError } = await supabaseServer
            .from("posts")
            .select("published_at, cover_url, translations:post_translations ( blocks )")
            .eq("id", id)
            .maybeSingle();

        if (currentError) {
            if (currentError.code === "22P02") {
                return { success: false, reason: "not_found" };
            }

            console.error("GET POST FOR UPDATE ERROR", currentError);

            return { success: false, reason: "save_failed" };
        }

        if (!current) {
            return { success: false, reason: "not_found" };
        }

        currentPublishedAt = current.published_at;
        previousFileUrls = collectFileUrls(
            (current.translations ?? []) as { blocks: unknown }[],
            current.cover_url,
        );
    }

    const { data, error } = await supabaseServer.rpc("save_admin_post", {
        p_post_id: id,
        p_payload: {
            slug,
            coverUrl,
            status,
            publishedAt: resolvePublishedAt(currentPublishedAt, status),
            translations,
        },
    });

    if (error) {
        console.error("SAVE POST RPC ERROR", error);

        return { success: false, reason: "save_failed" };
    }

    const result = data as {
        success: boolean;
        id?: string;
        reason?: SaveAdminPostFailReason;
    };

    if (!result.success || !result.id) {
        return { success: false, reason: result.reason ?? "save_failed" };
    }

    if (id) {
        const nextFileUrls = collectFileUrls(Object.values(translations), coverUrl);

        const removedFileUrls = [...previousFileUrls].filter(
            (url) => !nextFileUrls.has(url),
        );

        if (removedFileUrls.length) {
            await deletePostImages(removedFileUrls);
        }
    }

    return { success: true, id: result.id };
}
