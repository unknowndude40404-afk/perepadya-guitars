import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumbs"
      className={`max-w-full overflow-hidden ${className}`}
    >
      <ol className="flex max-w-full items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-[var(--text-secondary)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex shrink-0 items-center gap-2"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition hover:text-[var(--text-primary)]"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={
                    isLast
                      ? "font-medium text-[var(--text-primary)]"
                      : undefined
                  }
                >
                  {item.label}
                </span>
              )}

              {!isLast ? (
                <span className="text-[var(--text-secondary)]">/</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}