import { redirect } from "next/navigation";

type SearchParams = Record<string, string | string[] | undefined>;

type RedirectIfPageOutOfRangeParams = {
    pathname: string;
    searchParams: SearchParams;
    page: number;
    total: number;
    pageSize: number;
};

export function getPageHref(
    pathname: string,
    searchParams: SearchParams,
    page: number,
) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
        if (key === "page" || value === undefined) {
            continue;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => params.append(key, item));
        } else {
            params.set(key, value);
        }
    }

    if (page > 1) {
        params.set("page", String(page));
    }

    const queryString = params.toString();

    return queryString ? `${pathname}?${queryString}` : pathname;
}

export function redirectIfPageOutOfRange({
    pathname,
    searchParams,
    page,
    total,
    pageSize,
}: RedirectIfPageOutOfRangeParams) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    if (page > totalPages) {
        redirect(getPageHref(pathname, searchParams, totalPages));
    }
}