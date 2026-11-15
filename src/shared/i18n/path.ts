import { isLocale, type Locale } from "./config";

export function localizePath(locale: Locale, path: string = "/") {
    const normalized = path.startsWith("/") ? path : `/${path}`;

    return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function stripLocale(pathname: string) {
    const segments = pathname.split("/");

    if (isLocale(segments[1])) {
        const rest = segments.slice(2).join("/");

        return rest ? `/${rest}` : "/";
    }

    return pathname || "/";
}

export function switchLocaleInPath(pathname: string, locale: Locale) {
    return localizePath(locale, stripLocale(pathname));
}
