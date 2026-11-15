"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Dropdown } from "@/shared/ui/dropdown";
import { Input } from "@/shared/ui/input";
import { useDebounce } from "@/shared/lib/hooks/use-debounce";

import { useI18n } from "@/providers/locale-provider";

import { buildBlogUrl, type BlogSort } from "../model/blog-query";

type BlogToolbarProps = {
  q: string;
  sort: BlogSort;
};

export function BlogToolbar({ q, sort }: BlogToolbarProps) {
  const { dict, href } = useI18n();
  const blogPath = href("/blog");
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(q);

  const debouncedSearch = useDebounce(searchValue);

  const lastAppliedSearch = useRef(q);

  useEffect(() => {
    const nextSearch = debouncedSearch.trim();

    if (nextSearch === lastAppliedSearch.current) {
      return;
    }

    lastAppliedSearch.current = nextSearch;

    router.replace(buildBlogUrl({ q: nextSearch, sort, page: 1 }, blogPath), {
      scroll: false,
    });
  }, [blogPath, debouncedSearch, router, sort]);

  function handleSortToggle() {
    const nextSort: BlogSort = sort === "newest" ? "oldest" : "newest";

    router.push(
      buildBlogUrl({ q: lastAppliedSearch.current, sort: nextSort, page: 1 }, blogPath),
      { scroll: false },
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <Input
          type="search"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder={dict.blog.searchPlaceholder}
          aria-label={dict.blog.searchLabel}
        />
      </div>

      <Dropdown
        className="shrink-0"
        menuClassName="w-max min-w-[220px]"
        renderTrigger={({ open, toggle }) => (
          <button
            type="button"
            onClick={toggle}
            aria-label={dict.blog.sort}
            aria-expanded={open}
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
        {({ close }) => (
          <button
            type="button"
            onClick={() => {
              close();
              handleSortToggle();
            }}
            className="flex w-full cursor-pointer items-center justify-between gap-4 whitespace-nowrap px-4 py-3 text-left text-sm text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--card-bg-hover)]"
          >
            <span>{dict.blog.sortByDate}</span>

            <span className="text-[var(--accent-primary)]">
              {sort === "newest" ? "↓" : "↑"}
            </span>
          </button>
        )}
      </Dropdown>
    </div>
  );
}