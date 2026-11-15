"use client";

import Image from "next/image";
import {
    usePathname,
    useRouter,
    useSearchParams,
} from "next/navigation";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useDebounce } from "@/shared/lib/hooks/use-debounce";
import {
    Breadcrumbs,
    type BreadcrumbItem,
} from "@/shared/ui/breadcrumbs";
import { Input } from "@/shared/ui/input";
import { Dropdown } from "@/shared/ui/dropdown";
import { useI18n } from "@/providers/locale-provider";

import {
    CATALOG_DEFAULT_SORT,
    CATALOG_SEARCH_PARAMS,
    CATALOG_SORT_FIELDS,
    parseCatalogSort,
    type CatalogSortField,
} from "../config/catalog.config";

type CatalogHeaderProps = {
    breadcrumbs: BreadcrumbItem[];
};

export function CatalogHeader({
    breadcrumbs,
}: CatalogHeaderProps) {
    const { dict } = useI18n();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isFirstRender = useRef(true);

    const currentQuery =
        searchParams.toString();

    const currentSearch =
        searchParams.get(
            CATALOG_SEARCH_PARAMS.search,
        ) ?? "";

    const currentSort = parseCatalogSort(
        searchParams.get(CATALOG_SEARCH_PARAMS.sort),
    );

    const [searchValue, setSearchValue] =
        useState(currentSearch);

    const debouncedSearchValue =
        useDebounce(searchValue, 500);

    // Sync the field when the URL search changes (back/forward, links).
    const [syncedSearch, setSyncedSearch] =
        useState(currentSearch);

    if (syncedSearch !== currentSearch) {
        setSyncedSearch(currentSearch);
        setSearchValue(currentSearch);
    }

    const updateQueryParam = useCallback(
        (key: string, value: string) => {
            const params =
                new URLSearchParams(currentQuery);

            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }

            params.delete(
                CATALOG_SEARCH_PARAMS.page,
            );

            const nextQuery =
                params.toString();

            if (nextQuery === currentQuery) {
                return;
            }

            router.push(
                nextQuery
                    ? `${pathname}?${nextQuery}`
                    : pathname,
                {
                    scroll: false,
                },
            );
        },
        [
            currentQuery,
            pathname,
            router,
        ],
    );

    const submitSearch = useCallback(() => {
        const nextSearch =
            searchValue.trim();

        if (nextSearch === currentSearch) {
            return;
        }

        updateQueryParam(
            CATALOG_SEARCH_PARAMS.search,
            nextSearch,
        );
    }, [
        currentSearch,
        searchValue,
        updateQueryParam,
    ]);

    function handleSortSelect(field: CatalogSortField) {
        const option = CATALOG_SORT_FIELDS.find(
            (item) => item.value === field,
        );

        if (!option) {
            return;
        }

        const direction =
            field === currentSort.field
                ? currentSort.direction === "asc"
                    ? "desc"
                    : "asc"
                : option.defaultDirection;

        const nextSort = `${field}_${direction}`;

        updateQueryParam(
            CATALOG_SEARCH_PARAMS.sort,
            nextSort === CATALOG_DEFAULT_SORT ? "" : nextSort,
        );
    }

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Wait until typing settles; also skips a stale value
        // right after the URL changed (back/forward).
        if (debouncedSearchValue !== searchValue) {
            return;
        }

        const nextSearch =
            debouncedSearchValue.trim();

        if (nextSearch === currentSearch) {
            return;
        }

        updateQueryParam(
            CATALOG_SEARCH_PARAMS.search,
            nextSearch,
        );
    }, [
        currentSearch,
        debouncedSearchValue,
        searchValue,
        updateQueryParam,
    ]);

    return (
        <header className="flex min-w-0 flex-col gap-[20px] sm:gap-[24px]">
            <Breadcrumbs
                items={breadcrumbs}
            />

            <h1 className="text-[28px] font-bold text-[var(--text-primary)]">
                {dict.catalog.title}
            </h1>

            <div className="flex items-stretch gap-2">
                <div className="min-w-0 flex-1">
                    <Input
                        placeholder={dict.catalog.searchPlaceholder}
                        value={searchValue}
                        onChange={(event) =>
                            setSearchValue(event.target.value)
                        }
                        onBlur={submitSearch}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                submitSearch();
                            }
                        }}
                    />
                </div>

                <Dropdown
                    className="flex shrink-0"
                    menuClassName="w-max min-w-[220px]"
                    renderTrigger={({ toggle }) => (
                        <button
                            type="button"
                            onClick={toggle}
                            aria-label={dict.catalog.sort}
                            className="flex shrink-0 self-stretch cursor-pointer items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-2 py-2 outline-none transition-all duration-300 hover:border-[var(--border-hover)] focus:border-[var(--border-hover)] focus:shadow-[var(--shadow-primary)] active:scale-95"
                        >
                            <Image
                                src="/icons/sorting.svg"
                                alt=""
                                width={30}
                                height={30}
                                priority
                            />
                        </button>
                    )}
                >
                    {({ close }) =>
                        CATALOG_SORT_FIELDS.map((option) => {
                            const isActive =
                                option.value === currentSort.field;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        close();
                                        handleSortSelect(option.value);
                                    }}
                                    className="flex w-full cursor-pointer items-center justify-between gap-4 whitespace-nowrap px-4 py-3 text-left text-sm text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--card-bg-hover)]"
                                >
                                    <span>
                                        {dict.catalog[option.labelKey]}
                                    </span>

                                    {isActive ? (
                                        <span className="text-[var(--accent-primary)]">
                                            {currentSort.direction === "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        })
                    }
                </Dropdown>
            </div>
        </header>
    );
}