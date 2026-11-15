import {
    ADMIN_PRODUCTS_DEFAULT_SORT,
    ADMIN_PRODUCTS_DEFAULT_SORT_DIRECTION,
    ADMIN_PRODUCTS_DEFAULT_SORT_FIELD,
    ADMIN_PRODUCTS_SEARCH_PARAMS,
    ADMIN_PRODUCTS_SORT_FIELDS,
    type AdminProductsSortDirection,
    type AdminProductsSortField,
} from "../config/products.config";

export type AdminProductsQuery = {
    page: number;
    search: string;
    sortField: AdminProductsSortField;
    sortDirection: AdminProductsSortDirection;
    sort: string;
    showHidden: boolean;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function getSingleValue(value: string | string[] | undefined): string {
    if (Array.isArray(value)) {
        return value[0] ?? "";
    }

    return value ?? "";
}

function parsePage(value: string): number {
    const page = Number(value);

    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

function parseSort(value: string) {
    const [field, direction] = value.split("_");

    const isKnownField = ADMIN_PRODUCTS_SORT_FIELDS.some(
        (option) => option.value === field,
    );

    const isKnownDirection =
        direction === "asc" || direction === "desc";

    if (!isKnownField || !isKnownDirection) {
        return {
            sortField: ADMIN_PRODUCTS_DEFAULT_SORT_FIELD,
            sortDirection: ADMIN_PRODUCTS_DEFAULT_SORT_DIRECTION,
            sort: ADMIN_PRODUCTS_DEFAULT_SORT,
        };
    }

    return {
        sortField: field as AdminProductsSortField,
        sortDirection: direction as AdminProductsSortDirection,
        sort: value,
    };
}

export function parseAdminProductsQuery(
    searchParams: RawSearchParams,
): AdminProductsQuery {
    const sort = parseSort(
        getSingleValue(
            searchParams[ADMIN_PRODUCTS_SEARCH_PARAMS.sort],
        ),
    );

    return {
        page: parsePage(
            getSingleValue(
                searchParams[ADMIN_PRODUCTS_SEARCH_PARAMS.page],
            ),
        ),

        search: getSingleValue(
            searchParams[ADMIN_PRODUCTS_SEARCH_PARAMS.search],
        ).trim(),

        showHidden:
            getSingleValue(
                searchParams[
                ADMIN_PRODUCTS_SEARCH_PARAMS.showHidden
                ],
            ) === "1",

        ...sort,
    };
}

type BuildAdminProductsUrlParams = {
    searchParams: URLSearchParams;
    search?: string;
    sort?: string;
    showHidden?: boolean;
    resetPage?: boolean;
};

export function buildAdminProductsUrl({
    searchParams,
    search,
    sort,
    showHidden,
    resetPage = true,
}: BuildAdminProductsUrlParams) {
    const params = new URLSearchParams(searchParams.toString());

    if (search !== undefined) {
        if (search.trim()) {
            params.set(
                ADMIN_PRODUCTS_SEARCH_PARAMS.search,
                search.trim(),
            );
        } else {
            params.delete(ADMIN_PRODUCTS_SEARCH_PARAMS.search);
        }
    }

    if (sort !== undefined) {
        if (sort === ADMIN_PRODUCTS_DEFAULT_SORT) {
            params.delete(ADMIN_PRODUCTS_SEARCH_PARAMS.sort);
        } else {
            params.set(ADMIN_PRODUCTS_SEARCH_PARAMS.sort, sort);
        }
    }

    if (showHidden !== undefined) {
        if (showHidden) {
            params.set(
                ADMIN_PRODUCTS_SEARCH_PARAMS.showHidden,
                "1",
            );
        } else {
            params.delete(
                ADMIN_PRODUCTS_SEARCH_PARAMS.showHidden,
            );
        }
    }

    if (resetPage) {
        params.delete(ADMIN_PRODUCTS_SEARCH_PARAMS.page);
    }

    const query = params.toString();

    return query
        ? `/admin/products?${query}`
        : "/admin/products";
}