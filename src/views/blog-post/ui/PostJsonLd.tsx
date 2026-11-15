import type { Post } from "@/entities/post";
import { getPostImageUrls } from "@/entities/post/lib/get-post-image-urls";
import { SITE_NAME, SITE_URL } from "@/shared/config/site";
import { DEFAULT_LOCALE, LOCALE_META, type Locale } from "@/shared/i18n";
import { absoluteUrl } from "@/shared/i18n/metadata";

type PostJsonLdProps = {
  post: Post;
  locale: Locale;
};

export function PostJsonLd({ post, locale }: PostJsonLdProps) {
  const url = absoluteUrl(locale, `/blog/${post.slug}`);

  const imageUrls = getPostImageUrls(post.blocks);

  const images = post.coverUrl
    ? [post.coverUrl, ...imageUrls.filter((imageUrl) => imageUrl !== post.coverUrl)]
    : imageUrls;

  const author = {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
  };

  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt || undefined,
    url,
    mainEntityOfPage: url,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    inLanguage: LOCALE_META[post.isFallback ? DEFAULT_LOCALE : locale].htmlLang,
    author,
    publisher: author,
    ...(images.length ? { image: images } : {}),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}