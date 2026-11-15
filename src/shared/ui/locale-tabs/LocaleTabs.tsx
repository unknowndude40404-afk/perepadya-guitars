"use client";

import { LOCALES, type Locale } from "@/shared/i18n/config";

type LocaleTabsProps = {
    value: Locale;
    onChange: (locale: Locale) => void;
    isFilled: (locale: Locale) => boolean;
    isInvalid?: (locale: Locale) => boolean;
};

export function LocaleTabs({
    value,
    onChange,
    isFilled,
    isInvalid = () => false,
}: LocaleTabsProps) {
    return (
        <div
            role="tablist"
            className="flex flex-wrap gap-[6px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-[4px]"
        >
            {LOCALES.map((locale) => {
                const isActive = locale === value;
                const invalid = isInvalid(locale);
                const filled = isFilled(locale);

                return (
                    <button
                        key={locale}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => onChange(locale)}
                        className={`flex h-9 min-w-[64px] cursor-pointer items-center justify-center gap-[6px] rounded-xl px-3 text-sm font-semibold uppercase transition ${isActive
                            ? "bg-[var(--accent-primary)] text-black"
                            : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            } ${invalid && !isActive ? "text-[var(--error-primary)]" : ""}`}
                    >
                        {locale}

                        <span
                            aria-hidden
                            className={`size-[6px] rounded-full ${invalid
                                ? "bg-[var(--error-primary)]"
                                : filled
                                    ? isActive
                                        ? "bg-black/70"
                                        : "bg-[var(--accent-primary)]"
                                    : "bg-transparent"
                                }`}
                        />
                    </button>
                );
            })}
        </div>
    );
}
