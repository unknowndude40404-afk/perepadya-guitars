import type { ProductDetails } from "@/entities/product/model/product.types";
import {
  Breadcrumbs,
  BreadcrumbsJsonLd,
} from "@/shared/ui/breadcrumbs";

import { ProductSlider } from "./ProductSlider";
import { ProductInfo } from "./ProductInfo";
import { ProductDescription } from "./ProductDescription";
import { getBaseBreadcrumbs } from "@/shared/config/breadcrumbs";
import { getI18n } from "@/shared/i18n/server";
import { ProductJsonLd } from "./ProductJsonLd";

type ProductDetailsPageProps = {
  product: ProductDetails;
};

export async function ProductDetailsPage({
  product,
}: ProductDetailsPageProps) {
  const { locale, dict } = await getI18n();

  const breadcrumbItems = [
    ...getBaseBreadcrumbs(locale, dict),
    {
      label: product.name,
    },
  ];

  return (
    <div className="w-full p-5">
      <ProductJsonLd product={product} locale={locale} />

      <BreadcrumbsJsonLd items={breadcrumbItems} />

      <Breadcrumbs
        className="mb-4"
        items={breadcrumbItems}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,640px)_minmax(0,1fr)] lg:gap-8">
        <ProductSlider
          images={product.images}
        />

        <ProductInfo
          product={product}
          locale={locale}
          dict={dict}
        />
      </div>

      <div className="mt-6">
        <ProductDescription
          description={product.description}
        />
      </div>
    </div>
  );
}