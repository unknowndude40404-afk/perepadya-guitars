"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";
import Image from "next/image";
import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import { Input } from "@/shared/ui/input";
import { Dropdown } from "@/shared/ui/dropdown";
import { Checkbox } from "@/shared/ui/checkbox";
import { useDebounce } from "@/shared/lib/hooks/use-debounce";

import {
    ADMIN_PRODUCTS_SORT_FIELDS,
    type AdminProductsSortDirection,
    type AdminProductsSortField,
} from "../config/products.config";
import { buildAdminProductsUrl } from "../lib/products-url";

type ProductsToolbarProps = {
    search: string;
    sortField: AdminProductsSortField;
    sortDirection: AdminProductsSortDirection;
    showHidden: boolean;
};

export function ProductsToolbar({
    search,
    sortField,
    sortDirection,
    showHidden,
}: ProductsToolbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] =
        useState(search);

    const debouncedSearch = useDebounce(searchValue);

    const lastAppliedSearch = useRef(search);

    useEffect(() => {
        if (
            debouncedSearch === lastAppliedSearch.current
        ) {
            return;
        }

        lastAppliedSearch.current = debouncedSearch;

        router.push(
            buildAdminProductsUrl({
                searchParams,
                search: debouncedSearch,
            }),
            {
                scroll: false,
            },
        );
    }, [debouncedSearch, router, searchParams]);

    function handleSortSelect(
        field: AdminProductsSortField,
    ) {
        const nextDirection =
            field === sortField
                ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                : "asc";

        router.push(
            buildAdminProductsUrl({
                searchParams,
                sort: `${field}_${nextDirection}`,
            }),
            {
                scroll: false,
            },
        );
    }

    function handleShowHiddenChange(next: boolean) {
        router.push(
            buildAdminProductsUrl({
                searchParams,
                showHidden: next,
            }),
            {
                scroll: false,
            },
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[200px] flex-1">
                <Input
                    type="search"
                    value={searchValue}
                    onChange={(event) =>
                        setSearchValue(event.target.value)
                    }
                    placeholder="Пошук товарів..."
                />
            </div>

            <Dropdown
                className="shrink-0"
                menuClassName="w-max min-w-[220px]"
                renderTrigger={({ open, toggle }) => (
                    <button
                        type="button"
                        onClick={toggle}
                        aria-label="Сортування"
                        className={`flex size-[46px] cursor-pointer items-center justify-center rounded-2xl border bg-[var(--bg-primary)] transition-all duration-300 ${open
                            ? "border-[var(--border-hover)]"
                            : "border-[var(--border-primary)] hover:border-[var(--border-hover)]"
                            }`}
                    >
                        <Image
                            src="/icons/sorting.svg"
                            alt=""
                            width={20}
                            height={20}
                        />
                    </button>
                )}
            >
                {({ close }) =>
                    ADMIN_PRODUCTS_SORT_FIELDS.map(
                        (option) => {
                            const isActive =
                                option.value === sortField;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        close();
                                        handleSortSelect(
                                            option.value,
                                        );
                                    }}
                                    className="flex w-full cursor-pointer items-center justify-between gap-4 whitespace-nowrap px-4 py-3 text-left text-sm text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--card-bg-hover)]"
                                >
                                    <span>
                                        {option.label}
                                    </span>

                                    {isActive ? (
                                        <span className="text-[var(--accent-primary)]">
                                            {sortDirection ===
                                                "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    ) : null}
                                </button>
                            );
                        },
                    )
                }
            </Dropdown>

            <div className="shrink-0">
                <Checkbox
                    label="Показувати приховані"
                    checked={showHidden}
                    onChange={(event) =>
                        handleShowHiddenChange(
                            event.target.checked,
                        )
                    }
                />
            </div>
        </div>
    );
}