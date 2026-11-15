import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/shared/lib/auth";
import { revalidateSite } from "@/shared/lib/cache/revalidate-site";
import { supabaseServer } from "@/shared/lib/supabase/server";
import {
    getSaveAdminPostStatus,
    saveAdminPost,
} from "@/entities/post/api/save-admin-post";
import { deletePostImages } from "@/entities/post/api/post-images";
import { getPostFileUrls } from "@/entities/post/lib/get-post-file-urls";
import { parsePostBlocks } from "@/entities/post/lib/parse-post-blocks";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function PATCH(request: NextRequest, context: RouteContext) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const { id } = await context.params;

        const payload = await request.json();

        const result = await saveAdminPost(id, payload);

        if (!result.success) {
            return NextResponse.json(result, {
                status: getSaveAdminPostStatus(result.reason),
            });
        }

        revalidateSite();

        return NextResponse.json(result);
    } catch (error) {
        console.error("UPDATE POST ROUTE ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
    const { response: authResponse } = await requireAdminApi();

    if (authResponse) {
        return authResponse;
    }

    try {
        const { id } = await context.params;

        const { data: existing } = await supabaseServer
            .from("posts")
            .select("cover_url, translations:post_translations ( blocks )")
            .eq("id", id)
            .maybeSingle();

        const { data, error } = await supabaseServer
            .from("posts")
            .delete()
            .eq("id", id)
            .select("id");

        if (error) {
            if (error.code === "22P02") {
                return NextResponse.json(
                    { success: false, reason: "not_found" },
                    { status: 404 },
                );
            }

            console.error("DELETE POST ERROR", error);

            return NextResponse.json(
                { success: false, reason: "delete_failed" },
                { status: 500 },
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                { success: false, reason: "not_found" },
                { status: 404 },
            );
        }

        const deleted = (existing ?? {
            cover_url: null,
            translations: [],
        }) as {
            cover_url: string | null;
            translations: { blocks: unknown }[] | null;
        };

        const imageUrls = [
            ...new Set([
                ...(deleted.cover_url ? [deleted.cover_url] : []),
                ...(deleted.translations ?? []).flatMap((item) =>
                    getPostFileUrls(parsePostBlocks(item.blocks), null),
                ),
            ]),
        ];

        if (imageUrls.length) {
            await deletePostImages(imageUrls);
        }

        revalidateSite();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("DELETE POST ROUTE ERROR", error);

        return NextResponse.json(
            { success: false, reason: "internal_error" },
            { status: 500 },
        );
    }
}