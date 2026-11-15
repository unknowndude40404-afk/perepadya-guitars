import type { Product } from "@/entities/product/model/product.types";
import { ProductCard } from "@/entities/product/ui/product-card/product-card";
import { getI18n } from "@/shared/i18n/server";

type CatalogGridProps = {
    catalog: Product[];
};

export async function CatalogGrid({
    catalog,
}: CatalogGridProps) {
    const { locale, dict } = await getI18n();

    if (!catalog.length) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <p className="text-lg font-medium text-[var(--text-primary)]">
                    {dict.catalog.emptyTitle}
                </p>

                <p className="mt-2 max-w-[360px] text-sm text-[var(--text-secondary)]">
                    {dict.catalog.emptyHint}
                </p>
            </div>
        );
    }

    return (
        <div className="grid auto-rows-fr grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {catalog.map((product) => (
                <div
                    key={product.id}
                    className="group block h-full"
                >
                    <ProductCard
                        product={product}
                        locale={locale}
                        statusLabel={dict.product.status[product.status]}
                    />
                </div>
            ))}
        </div>
    );
}