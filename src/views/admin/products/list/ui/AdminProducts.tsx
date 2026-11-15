import Image from "next/image";

import { redirectIfPageOutOfRange } from "@/shared/lib/pagination";
import { Pagination } from "@/shared/ui/pagination";
import { ButtonLink } from "@/shared/ui/button-link";

import { getAdminProducts } from "../api/get-admin-products";
import { parseAdminProductsQuery } from "../lib/products-url";
import { ADMIN_PRODUCTS_PAGE_SIZE } from "../config/products.config";

import { ProductsToolbar } from "./ProductsToolbar";
import { ProductsTable } from "./ProductsTable";

type AdminProductsProps = {
    searchParams: Record<string, string | string[] | undefined>;
};

export async function AdminProducts({
    searchParams,
}: AdminProductsProps) {
    const query = parseAdminProductsQuery(searchParams);

    const result = await getAdminProducts(query);

    if (!result.success) {
        return (
            <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6 text-sm text-[var(--error-primary)]">
                Не вдалося завантажити товари
            </div>
        );
    }

    redirectIfPageOutOfRange({
        pathname: "/admin/products",
        searchParams,
        page: query.page,
        total: result.total,
        pageSize: ADMIN_PRODUCTS_PAGE_SIZE,
    });

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
                    Товари
                </h1>

                <span className="text-sm text-[var(--text-secondary)]">
                    Знайдено: {result.total}
                </span>
            </div>

            <ProductsToolbar
                search={query.search}
                sortField={query.sortField}
                sortDirection={query.sortDirection}
                showHidden={query.showHidden}
            />

            <div className="mt-6">
                <ProductsTable
                    products={result.products}
                />
            </div>

            <Pagination
                currentPage={query.page}
                totalItems={result.total}
                pageSize={ADMIN_PRODUCTS_PAGE_SIZE}
            />

            <ButtonLink
                href="/admin/products/new"
                aria-label="Додати товар"
                title="Додати товар"
                className="fixed bottom-8 right-8 z-30 size-14 rounded-full bg-[var(--accent-primary)] shadow-[0_8px_24px_rgba(184,188,196,0.25)] hover:bg-[var(--accent-hover)] active:scale-95"
            >
                <Image
                    src="/icons/plus.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="brightness-0"
                />
            </ButtonLink>
        </div>
    );
}