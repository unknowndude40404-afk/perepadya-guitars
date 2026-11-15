export const ADMIN_POSTS_PAGE_SIZE = 20;

export const ADMIN_POSTS_SEARCH_PARAMS = {
    page: "page",
    search: "q",
    sort: "sort",
    status: "status",
} as const;

export const ADMIN_POSTS_SORT_FIELDS = [
    {
        value: "created",
        label: "За датою створення",
    },
    {
        value: "published",
        label: "За датою публікації",
    },
    {
        value: "title",
        label: "За назвою",
    },
] as const;

export type AdminPostsSortField =
    (typeof ADMIN_POSTS_SORT_FIELDS)[number]["value"];

export type AdminPostsSortDirection = "asc" | "desc";

export const ADMIN_POSTS_DEFAULT_SORT_FIELD: AdminPostsSortField =
    "created";

export const ADMIN_POSTS_DEFAULT_SORT_DIRECTION: AdminPostsSortDirection =
    "desc";

export const ADMIN_POSTS_DEFAULT_SORT = `${ADMIN_POSTS_DEFAULT_SORT_FIELD}_${ADMIN_POSTS_DEFAULT_SORT_DIRECTION}`;

export const ADMIN_POSTS_STATUS_FILTERS = [
    {
        value: "all",
        label: "Усі",
    },
    {
        value: "published",
        label: "Опубліковані",
    },
    {
        value: "draft",
        label: "Чернетки",
    },
] as const;

export type AdminPostsStatusFilter = (typeof ADMIN_POSTS_STATUS_FILTERS)[number]["value"];

export const ADMIN_POSTS_DEFAULT_STATUS_FILTER: AdminPostsStatusFilter = "all";