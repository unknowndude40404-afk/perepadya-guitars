import { LOCALE_META } from "@/shared/i18n/config";

import type { Lead } from "../model/lead.types";

function escapeHtml(value: string) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

export function formatLeadMessage(lead: Lead) {
    return [
        "<b>Нова заявка з сайту</b>",
        `Ім’я: ${escapeHtml(lead.name)}`,
        lead.phone ? `Телефон: +${lead.phone}` : null,
        lead.email ? `Email: ${escapeHtml(lead.email)}` : null,
        lead.locale ? `Мова сайту: ${LOCALE_META[lead.locale].nativeName}` : null,
        lead.message ? `\nПовідомлення:\n${escapeHtml(lead.message)}` : null,
    ]
        .filter(Boolean)
        .join("\n");
}
