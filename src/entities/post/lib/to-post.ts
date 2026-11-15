import { DEFAULT_LOCALE, isLocale, type Locale } from "@/shared/i18n/config";

import type {
  AdminPost,
  Post,
  PostRow,
  PostTranslation,
  PostTranslationRow,
} from "../model/types";
import { parsePostBlocks } from "./parse-post-blocks";

function toTranslation(row: PostTranslationRow): PostTranslation {
  return {
    title: row.title,
    excerpt: row.excerpt,
    blocks: parsePostBlocks(row.blocks),
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
  };
}

export function toPost(row: PostRow, locale: Locale): Post | null {
  const translations = row.translations ?? [];

  const own = translations.find((item) => item.locale === locale);
  const fallback = translations.find((item) => item.locale === DEFAULT_LOCALE);
  const text = own ?? fallback ?? translations[0];

  if (!text) {
    return null;
  }

  return {
    id: row.id,
    slug: row.slug,
    coverUrl: row.cover_url,
    status: row.status,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    locales: translations.map((item) => item.locale).filter(isLocale),
    isFallback: !own,
    ...toTranslation(text),
  };
}

export function toAdminPost(row: PostRow): AdminPost {
  const translations: AdminPost["translations"] = {};

  for (const item of row.translations ?? []) {
    if (isLocale(item.locale)) {
      translations[item.locale] = toTranslation(item);
    }
  }

  return {
    id: row.id,
    slug: row.slug,
    coverUrl: row.cover_url,
    status: row.status,
    publishedAt: row.published_at,
    translations,
  };
}
