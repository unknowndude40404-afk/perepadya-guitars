"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { Dictionary, Locale } from "@/shared/i18n";
import { localizePath } from "@/shared/i18n";

type LocaleContextValue = {
    locale: Locale;
    dict: Dictionary;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
    locale,
    dict,
    children,
}: LocaleContextValue & { children: ReactNode }) {
    return (
        <LocaleContext.Provider value={{ locale, dict }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error("useI18n must be used within LocaleProvider");
    }

    const { locale, dict } = context;

    return {
        locale,
        dict,
        href: (path: string) => localizePath(locale, path),
    };
}
