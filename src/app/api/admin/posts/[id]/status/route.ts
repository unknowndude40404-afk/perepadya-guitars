import { NextRequest, NextResponse } from "next/server";

import type { PostStatus } from "@/entities/post";
import { resolvePublishedAt } from "@/entities/post/api/save-admin-post";
import { requireAdminApi } from "@/shared/lib/auth";
import { revalidateSite } from "@/shared/lib/cache/revalidate-site";
import { supabaseServer } from "@/shared/lib/supabase/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

function isPostStatus(value: unknown): value is PostStatus {
    return value === "draft" || value === "published";
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const { id } = await context.params;

        const body = (await request.json()) as { status?: unknown };

        if (!isPostStatus(body.status)) {
            return NextResponse.json(
                { success: false, reason: "invalid_input" },
                { status: 400 },
            );
        }

        const { data: current, error: currentError } = await supabaseServer
            .from("posts")
            .select("published_at")
            .eq("id", id)
            .maybeSingle();

        if (currentError) {
            if (currentError.code === "22P02") {
                return NextResponse.json(
                    { success: false, reason: "not_found" },
                    { status: 404 },
                );
            }

            console.error("GET POST FOR STATUS ERROR", currentError);

            return NextResponse.json(
                { success: false, reason: "update_failed" },
                { status: 500 },
            );
        }

        if (!current) {
            return NextResponse.json(
                { success: false, reason: "not_found" },
                { status: 404 },
            );
        }

        const { error } = await supabaseServer
            .from("posts")
            .update({
                status: body.status,
                published_at: resolvePublishedAt(
                    current.published_at,
                    body.status,
                ),
            })
            .eq("id", id);

        if (error) {
            console.error("UPDATE POST STATUS ERROR", error);

            return NextResponse.json(
                { success: false, reason: "update_failed" },
                { status: 500 },
            );
        }

        revalidateSite();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("UPDATE POST STATUS ROUTE ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}