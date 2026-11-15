import {
    ADMIN_POSTS_DEFAULT_SORT,
    ADMIN_POSTS_DEFAULT_SORT_DIRECTION,
    ADMIN_POSTS_DEFAULT_SORT_FIELD,
    ADMIN_POSTS_DEFAULT_STATUS_FILTER,
    ADMIN_POSTS_SEARCH_PARAMS,
    ADMIN_POSTS_SORT_FIELDS,
    ADMIN_POSTS_STATUS_FILTERS,
    type AdminPostsSortDirection,
    type AdminPostsSortField,
    type AdminPostsStatusFilter,
} from "../config/posts.config";

export type AdminPostsQuery = {
    page: number;
    search: string;
    sortField: AdminPostsSortField;
    sortDirection: AdminPostsSortDirection;
    sort: string;
    status: AdminPostsStatusFilter;
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

function isSortDirection(value: string): value is AdminPostsSortDirection {
    return value === "asc" || value === "desc";
}

function parseSort(value: string): Pick<
    AdminPostsQuery,
    "sortField" | "sortDirection" | "sort"
> {
    const [field, direction] = value.split("_");

    const fieldOption = ADMIN_POSTS_SORT_FIELDS.find(
        (option) => option.value === field,
    );

    if (!fieldOption || !isSortDirection(direction)) {
        return {
            sortField: ADMIN_POSTS_DEFAULT_SORT_FIELD,
            sortDirection: ADMIN_POSTS_DEFAULT_SORT_DIRECTION,
            sort: ADMIN_POSTS_DEFAULT_SORT,
        };
    }

    return {
        sortField: fieldOption.value,
        sortDirection: direction,
        sort: value,
    };
}

function parseStatus(value: string): AdminPostsStatusFilter {
    const option = ADMIN_POSTS_STATUS_FILTERS.find(
        (item) => item.value === value,
    );

    return option ? option.value : ADMIN_POSTS_DEFAULT_STATUS_FILTER;
}

export function parseAdminPostsQuery(
    searchParams: RawSearchParams,
): AdminPostsQuery {
    const sort = parseSort(
        getSingleValue(searchParams[ADMIN_POSTS_SEARCH_PARAMS.sort]),
    );

    return {
        page: parsePage(
            getSingleValue(searchParams[ADMIN_POSTS_SEARCH_PARAMS.page]),
        ),

        search: getSingleValue(
            searchParams[ADMIN_POSTS_SEARCH_PARAMS.search],
        ).trim(),

        status: parseStatus(
            getSingleValue(searchParams[ADMIN_POSTS_SEARCH_PARAMS.status]),
        ),

        ...sort,
    };
}

type BuildAdminPostsUrlParams = {
    searchParams: URLSearchParams;
    search?: string;
    sort?: string;
    status?: AdminPostsStatusFilter;
    resetPage?: boolean;
};

export function buildAdminPostsUrl({
    searchParams,
    search,
    sort,
    status,
    resetPage = true,
}: BuildAdminPostsUrlParams) {
    const params = new URLSearchParams(searchParams.toString());

    if (search !== undefined) {
        if (search.trim()) {
            params.set(ADMIN_POSTS_SEARCH_PARAMS.search, search.trim());
        } else {
            params.delete(ADMIN_POSTS_SEARCH_PARAMS.search);
        }
    }

    if (sort !== undefined) {
        if (sort === ADMIN_POSTS_DEFAULT_SORT) {
            params.delete(ADMIN_POSTS_SEARCH_PARAMS.sort);
        } else {
            params.set(ADMIN_POSTS_SEARCH_PARAMS.sort, sort);
        }
    }

    if (status !== undefined) {
        if (status === ADMIN_POSTS_DEFAULT_STATUS_FILTER) {
            params.delete(ADMIN_POSTS_SEARCH_PARAMS.status);
        } else {
            params.set(ADMIN_POSTS_SEARCH_PARAMS.status, status);
        }
    }

    if (resetPage) {
        params.delete(ADMIN_POSTS_SEARCH_PARAMS.page);
    }

    const query = params.toString();

    return query ? `/admin/posts?${query}` : "/admin/posts";
}