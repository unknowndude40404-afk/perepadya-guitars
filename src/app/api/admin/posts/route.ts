import { NextResponse } from "next/server";

import { requireAdminApi } from "@/shared/lib/auth";
import { revalidateSite } from "@/shared/lib/cache/revalidate-site";
import {
    getSaveAdminPostStatus,
    saveAdminPost,
} from "@/entities/post/api/save-admin-post";

export async function POST(request: Request) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const payload = await request.json();

        const result = await saveAdminPost(null, payload);

        if (!result.success) {
            return NextResponse.json(result, {
                status: getSaveAdminPostStatus(result.reason),
            });
        }

        revalidateSite();

        return NextResponse.json(result);
    } catch (error) {
        console.error("CREATE POST ROUTE ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}