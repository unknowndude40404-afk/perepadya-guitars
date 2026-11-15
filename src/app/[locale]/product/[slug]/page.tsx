import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getProductBySlug } from "@/entities/product/api/get-product-by-slug";
import { formatMessage } from "@/shared/i18n";
import { absoluteUrl, getAlternates } from "@/shared/i18n/metadata";
import { getI18n } from "@/shared/i18n/server";

import { ProductDetailsPage } from "@/views/product-details/ui/ProductDetailsPage";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { locale, dict } = await getI18n();

  const product = await getProductBySlug(slug, locale);

  if (!product) {
    return {
      title: dict.product.notFound,
    };
  }

  const title = product.seoTitle ?? product.name;

  const description =
    product.seoDescription ??
    formatMessage(dict.site.productDescription, { name: product.name });

  const path = `/product/${product.slug}`;

  const url = absoluteUrl(locale, path);

  const image = product.images[0];

  return {
    title,

    description,

    alternates: getAlternates({
      locale,
      path,
      availableLocales: product.locales,
    }),

    openGraph: {
      type: "website",
      title,
      description,
      url,
      images: image ? [{ url: image }] : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const { locale } = await getI18n();

  const product = await getProductBySlug(slug, locale);

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailsPage
      product={product}
    />
  );
}
