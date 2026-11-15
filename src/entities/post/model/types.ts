import type { Locale } from "@/shared/i18n/config";

import type { PostBlock } from "./blocks";

export type PostStatus = "draft" | "published";

export type PostTranslation = {
  title: string;
  excerpt: string | null;
  blocks: PostBlock[];
  seoTitle: string | null;
  seoDescription: string | null;
};

/** A post resolved to one locale (with English fallback). */
export type Post = PostTranslation & {
  id: string;
  slug: string;
  coverUrl: string | null;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  locales: Locale[];
  isFallback: boolean;
};

/** A post with all its translations (admin form). */
export type AdminPost = {
  id: string;
  slug: string;
  coverUrl: string | null;
  status: PostStatus;
  publishedAt: string | null;
  translations: Partial<Record<Locale, PostTranslation>>;
};

export type PostTranslationRow = {
  locale: string;
  title: string;
  excerpt: string | null;
  blocks: unknown;
  seo_title: string | null;
  seo_description: string | null;
};

export type PostRow = {
  id: string;
  slug: string;
  cover_url: string | null;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  translations: PostTranslationRow[] | null;
};

export const POST_SELECT = `
  id,
  slug,
  cover_url,
  status,
  published_at,
  created_at,
  updated_at,
  translations:post_translations (
    locale,
    title,
    excerpt,
    blocks,
    seo_title,
    seo_description
  )
`;
