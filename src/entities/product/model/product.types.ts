import type { Locale } from "@/shared/i18n";

import type { ProductStatus } from "../config/status.config";

export type Product = {
  id: string;

  name: string;
  slug: string;

  images: string[];

  sku: string;
  gtin: string | null;

  status: ProductStatus;
};

export type ProductDetails = Product & {
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;

  /** Locales that have their own translation. */
  locales: Locale[];

  /** True when the requested locale has no translation and English is shown. */
  isFallback: boolean;
};

export type ProductTranslation = {
  name: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};
