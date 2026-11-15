import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { isLocale, LOCALE_COOKIE } from "@/shared/i18n/config";
import { pickLocaleFromAcceptLanguage } from "@/shared/i18n/negotiate";

import {
    ADMIN_ACCESS_COOKIE,
    ADMIN_REFRESH_COOKIE,
    adminAccessCookieOptions,
    adminRefreshCookieOptions,
    clearedAdminCookieOptions,
} from "@/shared/lib/auth/cookies";

const REFRESH_THRESHOLD_SECONDS = 5 * 60;

function getTokenExpiry(token: string): number | null {
    try {
        const payload = token.split(".")[1];

        if (!payload) {
            return null;
        }

        const decoded = JSON.parse(
            atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
        );

        return typeof decoded.exp === "number" ? decoded.exp : null;
    } catch {
        return null;
    }
}

async function refreshAdminSession(request: NextRequest) {
    const accessToken = request.cookies.get(ADMIN_ACCESS_COOKIE)?.value;
    const refreshToken = request.cookies.get(ADMIN_REFRESH_COOKIE)?.value;

    if (!refreshToken) {
        return NextResponse.next();
    }

    const expiry = accessToken ? getTokenExpiry(accessToken) : null;
    const nowSeconds = Math.floor(Date.now() / 1000);

    const needsRefresh =
        !expiry || expiry - nowSeconds < REFRESH_THRESHOLD_SECONDS;

    if (!needsRefresh) {
        return NextResponse.next();
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        return NextResponse.next();
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
    });

    if (error || !data.session) {
        request.cookies.delete(ADMIN_ACCESS_COOKIE);
        request.cookies.delete(ADMIN_REFRESH_COOKIE);

        const response = NextResponse.next({ request });

        response.cookies.set(ADMIN_ACCESS_COOKIE, "", clearedAdminCookieOptions);
        response.cookies.set(ADMIN_REFRESH_COOKIE, "", clearedAdminCookieOptions);

        return response;
    }

    request.cookies.set(ADMIN_ACCESS_COOKIE, data.session.access_token);
    request.cookies.set(ADMIN_REFRESH_COOKIE, data.session.refresh_token);

    const response = NextResponse.next({ request });

    response.cookies.set(
        ADMIN_ACCESS_COOKIE,
        data.session.access_token,
        adminAccessCookieOptions,
    );

    response.cookies.set(
        ADMIN_REFRESH_COOKIE,
        data.session.refresh_token,
        adminRefreshCookieOptions,
    );

    return response;
}

const PUBLIC_FILE = /\.[^/]+$/;

function isAdminPath(pathname: string) {
    return (
        pathname === "/admin" ||
        pathname.startsWith("/admin/") ||
        pathname.startsWith("/api/admin/")
    );
}

function redirectToLocale(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    const firstSegment = pathname.split("/")[1];

    if (isLocale(firstSegment)) {
        return NextResponse.next();
    }

    const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;

    const locale = isLocale(cookieLocale)
        ? cookieLocale
        : pickLocaleFromAcceptLanguage(request.headers.get("accept-language"));

    const url = request.nextUrl.clone();

    url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    url.search = search;

    return NextResponse.redirect(url);
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isAdminPath(pathname)) {
        return refreshAdminSession(request);
    }

    if (pathname.startsWith("/api/") || PUBLIC_FILE.test(pathname)) {
        return NextResponse.next();
    }

    return redirectToLocale(request);
}

export const config = {
    matcher: ["/((?!_next/|favicon.ico).*)"],
};