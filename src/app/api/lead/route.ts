import { NextResponse } from "next/server";

import { parseLeadBody } from "@/entities/lead";
import { sendLead } from "@/entities/lead/api/send-lead";

export async function POST(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { success: false, reason: "invalid_body" },
            { status: 400 },
        );
    }

    const parsed = parseLeadBody(body);

    if (!parsed.success) {
        return NextResponse.json(
            { success: false, reason: parsed.reason },
            { status: 400 },
        );
    }

    const result = await sendLead(parsed.lead);

    if (!result.success) {
        return NextResponse.json(
            { success: false, reason: result.reason },
            { status: result.reason === "not_configured" ? 500 : 502 },
        );
    }

    return NextResponse.json({ success: true });
}
