export type BlogSort = "newest" | "oldest";

export type BlogQuery = {
    q: string;
    sort: BlogSort;
    page: number;
};

export const BLOG_PAGE_SIZE = 10;

const DEFAULT_SORT: BlogSort = "newest";

type SearchParamValue = string | string[] | undefined;

function getFirst(value: SearchParamValue): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

export function parseBlogQuery(
    params: Record<string, SearchParamValue>,
): BlogQuery {
    const q = (getFirst(params.q) ?? "").trim().slice(0, 100);

    const sort: BlogSort = getFirst(params.sort) === "oldest" ? "oldest" : "newest";

    const pageValue = Number(getFirst(params.page));
    const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;

    return { q, sort, page };
}

export function buildBlogUrl(query: BlogQuery, basePath = "/blog"): string {
    const params = new URLSearchParams();

    if (query.q) {
        params.set("q", query.q);
    }

    if (query.sort !== DEFAULT_SORT) {
        params.set("sort", query.sort);
    }

    if (query.page > 1) {
        params.set("page", String(query.page));
    }

    const search = params.toString();

    return search ? `${basePath}?${search}` : basePath;
}