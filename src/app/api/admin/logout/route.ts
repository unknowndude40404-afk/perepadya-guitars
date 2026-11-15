import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { supabaseServer } from "@/shared/lib/supabase/server";
import {
    ADMIN_ACCESS_COOKIE,
    ADMIN_REFRESH_COOKIE,
    clearedAdminCookieOptions,
} from "@/shared/lib/auth";

export async function POST() {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;

    if (accessToken) {
        const { error } = await supabaseServer.auth.admin.signOut(
            accessToken,
            "local",
        );

        if (error) {
            console.error("ADMIN LOGOUT SUPABASE ERROR", error);
        }
    }

    const response = NextResponse.json({
        success: true,
    });

    response.cookies.set(ADMIN_ACCESS_COOKIE, "", clearedAdminCookieOptions);
    response.cookies.set(ADMIN_REFRESH_COOKIE, "", clearedAdminCookieOptions);

    return response;
}