export const ADMIN_PRODUCTS_PAGE_SIZE = 20;

export const ADMIN_PRODUCTS_SEARCH_PARAMS = {
    page: "page",
    search: "q",
    sort: "sort",
    showHidden: "hidden",
} as const;

export const ADMIN_PRODUCTS_SORT_FIELDS = [
    {
        value: "created",
        label: "За датою",
    },
    {
        value: "name",
        label: "За назвою",
    },
] as const;

export type AdminProductsSortField =
    (typeof ADMIN_PRODUCTS_SORT_FIELDS)[number]["value"];

export type AdminProductsSortDirection = "asc" | "desc";

export const ADMIN_PRODUCTS_DEFAULT_SORT_FIELD: AdminProductsSortField =
    "created";

export const ADMIN_PRODUCTS_DEFAULT_SORT_DIRECTION: AdminProductsSortDirection =
    "desc";

export const ADMIN_PRODUCTS_DEFAULT_SORT = "created_desc";