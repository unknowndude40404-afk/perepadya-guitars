import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

import {
    getAdminSession,
    type AdminSession,
} from "./get-admin-session";

type RequireAdminApiResult =
    | { session: AdminSession; response: null }
    | { session: null; response: NextResponse };

export async function requireAdminPage(): Promise<AdminSession> {
    const session = await getAdminSession();

    if (!session) {
        redirect("/admin/login");
    }

    return session;
}

export async function requireAdminApi(): Promise<RequireAdminApiResult> {
    const session = await getAdminSession();

    if (!session) {
        return {
            session: null,
            response: NextResponse.json(
                {
                    success: false,
                    reason: "unauthorized",
                },
                {
                    status: 401,
                },
            ),
        };
    }

    return {
        session,
        response: null,
    };
}