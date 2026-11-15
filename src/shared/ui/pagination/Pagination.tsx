"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type PaginationProps = {
	currentPage: number;
	totalItems: number;
	pageSize: number;
	getPageHref?: (page: number) => string;
	labels?: {
		prev: string;
		next: string;
		pages: string;
	};
};

const DEFAULT_LABELS = {
	prev: "Попередня сторінка",
	next: "Наступна сторінка",
	pages: "Сторінки",
};

const SIBLING_COUNT = 1;

const ARROW_CLASS =
	"flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-primary)] text-[var(--text-primary)] transition-all duration-200";

const PAGE_CLASS =
	"flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-all duration-200";

const HOVER_CLASS =
	"hover:border-[var(--border-hover)] hover:bg-[var(--bg-secondary)]";

function getPaginationItems(currentPage: number, totalPages: number) {
	const items: Array<number | "..."> = [];

	const leftSibling = Math.max(currentPage - SIBLING_COUNT, 1);
	const rightSibling = Math.min(currentPage + SIBLING_COUNT, totalPages);

	items.push(1);

	if (leftSibling > 2) {
		items.push("...");
	}

	for (
		let page = Math.max(2, leftSibling);
		page <= Math.min(totalPages - 1, rightSibling);
		page++
	) {
		items.push(page);
	}

	if (rightSibling < totalPages - 1) {
		items.push("...");
	}

	if (totalPages > 1) {
		items.push(totalPages);
	}

	return items;
}

function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			className="size-4"
			aria-hidden
		>
			<path d={direction === "prev" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
		</svg>
	);
}

export function Pagination({
	currentPage,
	totalItems,
	pageSize,
	getPageHref,
	labels = DEFAULT_LABELS,
}: PaginationProps) {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const totalPages = Math.ceil(totalItems / pageSize);

	if (totalPages <= 1) {
		return null;
	}

	function getHref(page: number): string {
		if (getPageHref) {
			return getPageHref(page);
		}

		const params = new URLSearchParams(searchParams.toString());

		if (page > 1) {
			params.set("page", String(page));
		} else {
			params.delete("page");
		}

		const query = params.toString();

		return query ? `${pathname}?${query}` : pathname;
	}

	function renderArrow(direction: "prev" | "next") {
		const page = direction === "prev" ? currentPage - 1 : currentPage + 1;
		const disabled = page < 1 || page > totalPages;
		const label =
			direction === "prev" ? labels.prev : labels.next;

		if (disabled) {
			return (
				<span
					aria-disabled="true"
					aria-label={label}
					className={`${ARROW_CLASS} cursor-not-allowed opacity-40`}
				>
					<ArrowIcon direction={direction} />
				</span>
			);
		}

		return (
			<Link
				href={getHref(page)}
				aria-label={label}
				rel={direction}
				className={`${ARROW_CLASS} ${HOVER_CLASS}`}
			>
				<ArrowIcon direction={direction} />
			</Link>
		);
	}

	const items = getPaginationItems(currentPage, totalPages);

	return (
		<nav
			aria-label={labels.pages}
			className="mt-8 flex items-center justify-center gap-2"
		>
			{renderArrow("prev")}

			<div className="flex items-center gap-1">
				{items.map((item, index) => {
					if (item === "...") {
						return (
							<span
								key={`ellipsis-${index}`}
								className="flex h-10 min-w-10 items-center justify-center text-sm text-[var(--text-secondary)]"
							>
								...
							</span>
						);
					}

					const active = item === currentPage;

					return (
						<Link
							key={item}
							href={getHref(item)}
							aria-current={active ? "page" : undefined}
							className={`${PAGE_CLASS} ${active
								? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white shadow-[var(--shadow-primary)]"
								: `border-[var(--border-primary)] text-[var(--text-primary)] ${HOVER_CLASS}`
								}`}
						>
							{item}
						</Link>
					);
				})}
			</div>

			{renderArrow("next")}
		</nav>
	);
}