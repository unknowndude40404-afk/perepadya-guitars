"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { useI18n } from "@/providers/locale-provider";
import {
    LOCALE_COOKIE,
    LOCALE_COOKIE_MAX_AGE,
    LOCALE_META,
    LOCALES,
    switchLocaleInPath,
    type Locale,
} from "@/shared/i18n";

function saveLocaleCookie(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

function GlobeIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={className}
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18" />
            <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
        </svg>
    );
}

function CheckIcon({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className={className}
        >
            <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
    );
}

export function LanguageSwitcher() {
    const { locale, dict } = useI18n();
    const router = useRouter();
    const pathname = usePathname();

    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const closeButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const previousOverflow = document.body.style.overflow;

        document.body.style.overflow = "hidden";
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    function selectLocale(nextLocale: Locale) {
        saveLocaleCookie(nextLocale);

        setIsOpen(false);

        if (nextLocale === locale) {
            return;
        }

        const query = window.location.search;
        const nextPath = switchLocaleInPath(pathname, nextLocale);

        startTransition(() => {
            router.replace(`${nextPath}${query}`, {
                scroll: false,
            });
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={`${dict.languageSwitcher.button}: ${LOCALE_META[locale].nativeName}`}
                disabled={isPending}
                className="flex h-[40px] cursor-pointer items-center gap-[8px] rounded-full px-[12px] text-[14px] font-semibold text-[var(--text-primary)] transition hover:text-[var(--accent-primary)] disabled:opacity-60"
            >
                <GlobeIcon className="size-[20px]" />

                <span className="max-[576px]:hidden">
                    {LOCALE_META[locale].nativeName}
                </span>

                <span className="hidden uppercase max-[576px]:inline">
                    {locale}
                </span>
            </button>

            {isOpen ? (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--overlay-bg)] p-4 backdrop-blur-[4px]"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="language-switcher-title"
                        onClick={(event) => event.stopPropagation()}
                        className="w-full max-w-[720px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] p-6 shadow-[var(--shadow-primary)] sm:p-8"
                    >
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <h2
                                id="language-switcher-title"
                                className="text-[22px] font-bold text-[var(--text-primary)] sm:text-[26px]"
                            >
                                {dict.languageSwitcher.title}
                            </h2>

                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label={dict.languageSwitcher.close}
                                className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[22px] leading-none text-[var(--text-secondary)] transition hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                            >
                                ✕
                            </button>
                        </div>

                        <ul className="grid grid-cols-2 gap-[8px] sm:grid-cols-3 lg:grid-cols-4">
                            {LOCALES.map((item) => {
                                const isActive = item === locale;

                                return (
                                    <li key={item}>
                                        <button
                                            type="button"
                                            lang={LOCALE_META[item].htmlLang}
                                            onClick={() => selectLocale(item)}
                                            aria-current={isActive ? "true" : undefined}
                                            className={`flex w-full cursor-pointer items-start justify-between gap-2 rounded-xl px-[14px] py-[12px] text-left transition ${isActive
                                                ? "bg-[var(--accent-subtle)]"
                                                : "hover:bg-[var(--bg-secondary)]"
                                                }`}
                                        >
                                            <span className="flex min-w-0 flex-col gap-[2px]">
                                                <span
                                                    className={`truncate text-[15px] font-semibold ${isActive
                                                        ? "text-[var(--accent-primary)]"
                                                        : "text-[var(--text-primary)]"
                                                        }`}
                                                >
                                                    {LOCALE_META[item].nativeName}
                                                </span>

                                                <span className="truncate text-[13px] text-[var(--text-secondary)]">
                                                    {dict.languages[item]}
                                                </span>
                                            </span>

                                            {isActive ? (
                                                <CheckIcon className="mt-[2px] size-[18px] shrink-0 text-[var(--accent-primary)]" />
                                            ) : null}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            ) : null}
        </>
    );
}
