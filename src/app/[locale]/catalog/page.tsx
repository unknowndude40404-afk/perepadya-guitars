import type { Metadata } from "next";

import { getAlternates } from "@/shared/i18n/metadata";
import { getI18n } from "@/shared/i18n/server";

import { CatalogPage } from "@/views/catalog";

type PageSearchParams = {
  search?: string;
  sort?: string;
  page?: string;
  pageSize?: string;
};

type PageProps = {
  searchParams: Promise<PageSearchParams>;
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale, dict } = await getI18n();

  return {
    title: dict.catalog.title,
    description: dict.site.description,
    alternates: getAlternates({ locale, path: "/catalog" }),
  };
}

export default async function Page({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <CatalogPage
      searchParams={resolvedSearchParams}
    />
  );
}
