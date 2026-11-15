export const CATALOG_DEFAULT_PAGE = 1;
export const CATALOG_PAGE_SIZE = 16;
export const CATALOG_SEARCH_PARAMS = {
    search: "search",
    sort: "sort",
    page: "page",
    pageSize: "pageSize",
} as const;

export type CatalogSortDirection = "asc" | "desc";

/**
 * Sort fields. `defaultDirection` is used when the field is picked
 * for the first time; picking the active field again flips the direction.
 * For status, "asc" means in stock first.
 */
export const CATALOG_SORT_FIELDS = [
    { value: "date", labelKey: "sortByDate", defaultDirection: "desc" },
    { value: "name", labelKey: "sortByName", defaultDirection: "asc" },
    { value: "status", labelKey: "sortByStatus", defaultDirection: "asc" },
] as const satisfies readonly {
    value: string;
    labelKey: string;
    defaultDirection: CatalogSortDirection;
}[];

export type CatalogSortField = (typeof CATALOG_SORT_FIELDS)[number]["value"];

export const CATALOG_DEFAULT_SORT = "date_desc";

export function parseCatalogSort(value: string | null | undefined): {
    field: CatalogSortField;
    direction: CatalogSortDirection;
    sort: string;
} {
    const [field, direction] = (value ?? "").split("_");
    const option = CATALOG_SORT_FIELDS.find((item) => item.value === field);

    if (!option || (direction !== "asc" && direction !== "desc")) {
        return { field: "date", direction: "desc", sort: CATALOG_DEFAULT_SORT };
    }

    return { field: option.value, direction, sort: `${option.value}_${direction}` };
}
