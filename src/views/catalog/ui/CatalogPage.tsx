import { notFound } from "next/navigation";

import { getBaseBreadcrumbs } from "@/shared/config/breadcrumbs";
import { getI18n } from "@/shared/i18n/server";
import { BreadcrumbsJsonLd } from "@/shared/ui/breadcrumbs";
import { Pagination } from "@/shared/ui/pagination";

import { getCatalogPageData } from "../api/get-catalog-page-data";
import {
    CATALOG_DEFAULT_PAGE,
    CATALOG_PAGE_SIZE,
} from "../config/catalog.config";

import { CatalogGrid } from "./CatalogGrid";
import { CatalogHeader } from "./CatalogHeader";

const CATALOG_MAX_PAGE_SIZE = 60;

type CatalogPageSearchParams = {
    search?: string;
    sort?: string;
    page?: string;
    pageSize?: string;
};

type CatalogPageProps = {
    searchParams: CatalogPageSearchParams;
};

function parsePositiveInteger(
    value: string | undefined,
    fallback: number,
) {
    const parsed = Number(value);

    return Number.isInteger(parsed) && parsed > 0
        ? parsed
        : fallback;
}

export async function CatalogPage({
    searchParams,
}: CatalogPageProps) {
    const { locale, dict } = await getI18n();

    const page = parsePositiveInteger(
        searchParams.page,
        CATALOG_DEFAULT_PAGE,
    );

    const pageSize = Math.min(
        parsePositiveInteger(
            searchParams.pageSize,
            CATALOG_PAGE_SIZE,
        ),
        CATALOG_MAX_PAGE_SIZE,
    );

    const catalogResponse = await getCatalogPageData({
        search: searchParams.search,
        sort: searchParams.sort,
        page,
        pageSize,
        locale,
    });

    const totalPages = Math.max(
        1,
        Math.ceil(catalogResponse.total / pageSize),
    );

    if (page > totalPages) {
        notFound();
    }

    const breadcrumbItems = getBaseBreadcrumbs(locale, dict);

    return (
        <div className="flex w-full flex-col gap-6 p-6">
            <BreadcrumbsJsonLd items={breadcrumbItems} />

            <CatalogHeader
                breadcrumbs={breadcrumbItems}
            />

            <div className="min-w-0">
                <CatalogGrid
                    catalog={
                        catalogResponse.data
                    }
                />

                <Pagination
                    currentPage={
                        catalogResponse.page
                    }
                    totalItems={
                        catalogResponse.total
                    }
                    pageSize={
                        catalogResponse.pageSize
                    }
                    labels={dict.pagination}
                />
            </div>
        </div>
    );
}
