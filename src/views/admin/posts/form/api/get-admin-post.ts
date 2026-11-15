import "server-only";

import {
    POST_SELECT,
    toAdminPost,
    type AdminPost,
    type PostRow,
} from "@/entities/post";
import { supabaseServer } from "@/shared/lib/supabase/server";

type GetAdminPostResult =
    | { success: true; post: AdminPost }
    | { success: false };

export async function getAdminPost(id: string): Promise<GetAdminPostResult> {
    const { data, error } = await supabaseServer
        .from("posts")
        .select(POST_SELECT)
        .eq("id", id)
        .maybeSingle();

    if (error) {
        if (error.code !== "22P02") {
            console.error("GET ADMIN POST ERROR", error);
        }

        return { success: false };
    }

    if (!data) {
        return { success: false };
    }

    return { success: true, post: toAdminPost(data as unknown as PostRow) };
}
