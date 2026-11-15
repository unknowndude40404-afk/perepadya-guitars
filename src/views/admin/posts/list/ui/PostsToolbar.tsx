"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/shared/ui/input";
import { Dropdown } from "@/shared/ui/dropdown";
import { SelectDropdown } from "@/shared/ui/select-dropdown";
import { useDebounce } from "@/shared/lib/hooks/use-debounce";

import {
    ADMIN_POSTS_SORT_FIELDS,
    ADMIN_POSTS_STATUS_FILTERS,
    type AdminPostsSortDirection,
    type AdminPostsSortField,
    type AdminPostsStatusFilter,
} from "../config/posts.config";
import { buildAdminPostsUrl } from "../lib/posts-url";

type PostsToolbarProps = {
    search: string;
    sortField: AdminPostsSortField;
    sortDirection: AdminPostsSortDirection;
    status: AdminPostsStatusFilter;
};

export function PostsToolbar({
    search,
    sortField,
    sortDirection,
    status,
}: PostsToolbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] = useState(search);

    const debouncedSearch = useDebounce(searchValue);

    const lastAppliedSearch = useRef(search);

    useEffect(() => {
        if (debouncedSearch === lastAppliedSearch.current) {
            return;
        }

        lastAppliedSearch.current = debouncedSearch;

        router.push(
            buildAdminPostsUrl({
                searchParams,
                search: debouncedSearch,
            }),
            {
                scroll: false,
            },
        );
    }, [debouncedSearch, router, searchParams]);

    function handleSortSelect(field: AdminPostsSortField) {
        const nextDirection =
            field === sortField
                ? sortDirection === "asc"
                    ? "desc"
                    : "asc"
                : "asc";

        router.push(
            buildAdminPostsUrl({
                searchParams,
                sort: `${field}_${nextDirection}`,
            }),
            {
                scroll: false,
            },
        );
    }

    function handleStatusChange(value: string) {
        const option = ADMIN_POSTS_STATUS_FILTERS.find(
            (item) => item.value === value,
        );

        if (!option) {
            return;
        }

        router.push(
            buildAdminPostsUrl({
                searchParams,
                status: option.value,
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
                    onChange={(event) => setSearchValue(event.target.value)}
                    placeholder="Пошук постів..."
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
                    ADMIN_POSTS_SORT_FIELDS.map((option) => {
                        const isActive = option.value === sortField;

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
                                <span>{option.label}</span>

                                {isActive ? (
                                    <span className="text-[var(--accent-primary)]">
                                        {sortDirection === "asc" ? "↑" : "↓"}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })
                }
            </Dropdown>

            <SelectDropdown
                options={ADMIN_POSTS_STATUS_FILTERS}
                defaultValue={status}
                onChange={handleStatusChange}
                className="shrink-0"
                renderTrigger={({ open, selectedOption, toggle }) => (
                    <button
                        type="button"
                        onClick={toggle}
                        aria-label="Фільтр за статусом"
                        aria-expanded={open}
                        className={`flex h-[46px] cursor-pointer items-center gap-3 rounded-2xl border bg-[var(--bg-primary)] px-4 text-sm text-[var(--text-primary)] transition-all duration-300 ${open
                            ? "border-[var(--border-hover)]"
                            : "border-[var(--border-primary)] hover:border-[var(--border-hover)]"
                            }`}
                    >
                        {selectedOption?.label}

                        <Image
                            src="/icons/arrow.svg"
                            alt=""
                            width={16}
                            height={16}
                            className={`transition-transform duration-200 ${open ? "rotate-180" : ""
                                }`}
                        />
                    </button>
                )}
            />
        </div>
    );
}