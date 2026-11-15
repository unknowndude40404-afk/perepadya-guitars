const DAY_IN_SECONDS = 60 * 60 * 24;

export const ADMIN_ACCESS_COOKIE = "admin-access-token";
export const ADMIN_REFRESH_COOKIE = "admin-refresh-token";

const isProduction =
    process.env.NODE_ENV === "production";

export const adminAccessCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: DAY_IN_SECONDS,
};

export const adminRefreshCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: DAY_IN_SECONDS * 30,
};

export const clearedAdminCookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
};