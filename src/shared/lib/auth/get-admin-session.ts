import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

import { ADMIN_ACCESS_COOKIE } from "./cookies";

const supabaseUrl = process.env.SUPABASE_URL;
const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
    throw new Error("Missing SUPABASE_URL");
}

if (!supabasePublishableKey) {
    throw new Error("Missing SUPABASE_PUBLISHABLE_KEY");
}

export const supabaseAuth = createClient(
    supabaseUrl,
    supabasePublishableKey,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    },
);

export type AdminSession = {
    userId: string;
    email: string | null;
};

export async function getAdminSession(): Promise<AdminSession | null> {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get(
        ADMIN_ACCESS_COOKIE,
    )?.value;

    if (!accessToken) {
        return null;
    }

    const { data, error } =
        await supabaseAuth.auth.getUser(
            accessToken,
        );

    if (error || !data.user) {
        return null;
    }

    if (data.user.app_metadata?.role !== "admin") {
        return null;
    }

    return {
        userId: data.user.id,
        email: data.user.email ?? null,
    };
}