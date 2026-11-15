import "server-only";

import { formatLeadMessage } from "../lib/format-lead-message";
import type { Lead } from "../model/lead.types";

type SendLeadResult =
    | { success: true; delivered: boolean }
    | { success: false; reason: "not_configured" | "telegram_failed" };

export async function sendLead(lead: Lead): Promise<SendLeadResult> {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const text = formatLeadMessage(lead);

    if (!token || !chatId) {
        if (process.env.NODE_ENV !== "production") {
            console.info(
                "LEAD (Telegram is not configured, message not sent):\n" + text,
            );

            return { success: true, delivered: false };
        }

        console.error("LEAD: Telegram env is not configured");

        return { success: false, reason: "not_configured" };
    }

    try {
        const response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text,
                    parse_mode: "HTML",
                    disable_web_page_preview: true,
                }),
                cache: "no-store",
            },
        );

        if (!response.ok) {
            console.error("LEAD: Telegram error", await response.text());

            return { success: false, reason: "telegram_failed" };
        }

        return { success: true, delivered: true };
    } catch (error) {
        console.error("LEAD: Telegram request failed", error);

        return { success: false, reason: "telegram_failed" };
    }
}
