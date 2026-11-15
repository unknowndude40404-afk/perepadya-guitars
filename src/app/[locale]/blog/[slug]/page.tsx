import type { Metadata } from "next";

import { getI18n } from "@/shared/i18n/server";
import { BlogPostPage, getPostMetadata } from "@/views/blog-post";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale } = await getI18n();

  return getPostMetadata(slug, locale);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;

  return <BlogPostPage slug={slug} />;
}
