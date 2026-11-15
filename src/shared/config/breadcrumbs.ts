import type { Dictionary, Locale } from "@/shared/i18n";
import { localizePath } from "@/shared/i18n";

export function getHomeBreadcrumb(locale: Locale, dict: Dictionary) {
    return { label: dict.nav.home, href: localizePath(locale, "/") };
}

export function getBaseBreadcrumbs(locale: Locale, dict: Dictionary) {
    return [
        getHomeBreadcrumb(locale, dict),
        { label: dict.nav.showcase, href: localizePath(locale, "/catalog") },
    ];
}
