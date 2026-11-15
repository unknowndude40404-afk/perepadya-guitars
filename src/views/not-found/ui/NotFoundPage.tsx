import Link from "next/link";

import { localizePath } from "@/shared/i18n";
import { getI18n } from "@/shared/i18n/server";

export async function NotFoundPage() {
  const { locale, dict } = await getI18n();

  return (
    <div className="flex w-full flex-1 items-center justify-center bg-[var(--bg-primary)] px-4 py-24 text-[var(--text-primary)]">
      <div className="max-w-[520px] text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] opacity-60">
          404
        </p>

        <h1 className="mb-4 text-[clamp(32px,5vw,56px)] font-bold leading-tight">
          {dict.notFound.title}
        </h1>

        <p className="mb-8 text-base leading-7 opacity-70">
          {dict.notFound.text}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href={localizePath(locale, "/")}
            className="inline-flex rounded-full bg-[var(--text-primary)] px-6 py-3 text-sm font-semibold text-[var(--bg-primary)] transition-opacity hover:opacity-80"
          >
            {dict.notFound.home}
          </Link>

          <Link
            href={localizePath(locale, "/catalog")}
            className="inline-flex rounded-full border border-[var(--border-primary)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-hover)]"
          >
            {dict.notFound.showcase}
          </Link>
        </div>
      </div>
    </div>
  );
}
