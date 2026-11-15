import { NextResponse } from "next/server";

import {
    supabaseAuth,
    ADMIN_ACCESS_COOKIE,
    ADMIN_REFRESH_COOKIE,
    adminAccessCookieOptions,
    adminRefreshCookieOptions,
} from "@/shared/lib/auth";

type LoginBody = {
    email?: string;
    password?: string;
};

export async function POST(
    request: Request,
) {
    try {
        const body =
            (await request.json()) as LoginBody;

        const email =
            body.email?.trim().toLowerCase();

        const password =
            body.password;

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    reason: "invalid_credentials",
                },
                {
                    status: 400,
                },
            );
        }

        const { data, error } =
            await supabaseAuth.auth.signInWithPassword({
                email,
                password,
            });

        if (
            error ||
            !data.session ||
            !data.user
        ) {
            return NextResponse.json(
                {
                    success: false,
                    reason: "invalid_credentials",
                },
                {
                    status: 401,
                },
            );
        }

        if (
            data.user.app_metadata?.role !== "admin"
        ) {
            return NextResponse.json(
                {
                    success: false,
                    reason: "invalid_credentials",
                },
                {
                    status: 401,
                },
            );
        }

        const response = NextResponse.json({
            success: true,
        });

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
    } catch (error) {
        console.error(
            "ADMIN LOGIN ERROR",
            error,
        );

        return NextResponse.json(
            {
                success: false,
                reason: "internal_error",
            },
            {
                status: 500,
            },
        );
    }
}