import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/shared/lib/auth";
import { supabaseServer } from "@/shared/lib/supabase/server";
import { revalidateSite } from "@/shared/lib/cache/revalidate-site";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(
    request: NextRequest,
    context: RouteContext,
) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const { id } = await context.params;

        const body = (await request.json()) as {
            isHidden?: boolean;
        };

        if (typeof body.isHidden !== "boolean") {
            return NextResponse.json(
                { success: false, reason: "invalid_input" },
                { status: 400 },
            );
        }

        const { error } = await supabaseServer
            .from("products")
            .update({
                isHidden: body.isHidden,
                updatedAt: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error(
                "TOGGLE VISIBILITY ERROR",
                error.message,
            );

            return NextResponse.json(
                { success: false, reason: "update_failed" },
                { status: 500 },
            );
        }
        revalidateSite();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("TOGGLE VISIBILITY ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}