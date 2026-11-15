import { isLocale } from "@/shared/i18n/config";

import { LEAD_CONTACT_TYPES, LEAD_LIMITS, type Lead, type LeadContactType } from "../model/lead.types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isLeadContactType(value: unknown): value is LeadContactType {
    return (
        typeof value === "string" &&
        (LEAD_CONTACT_TYPES as readonly string[]).includes(value)
    );
}

export function isValidLeadName(value: string) {
    const name = value.trim();

    return name.length > 0 && name.length <= LEAD_LIMITS.name;
}

/** International number without "+": country code + number, 8–15 digits (E.164). */
export function isValidLeadPhone(digits: string) {
    return /^[1-9]\d{7,14}$/.test(digits);
}

export function isValidLeadEmail(value: string) {
    const email = value.trim();

    return email.length <= LEAD_LIMITS.email && EMAIL_PATTERN.test(email);
}

export function isValidLeadMessage(value: string) {
    return value.trim().length <= LEAD_LIMITS.message;
}

type ParseLeadResult =
    | { success: true; lead: Lead }
    | { success: false; reason: "invalid_fields" };

export function parseLeadBody(body: unknown): ParseLeadResult {
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return { success: false, reason: "invalid_fields" };
    }

    const record = body as Record<string, unknown>;

    const name = typeof record.name === "string" ? record.name.trim() : "";
    const contactType = record.contactType;
    const phone =
        typeof record.phone === "string" ? record.phone.replace(/\D/g, "") : "";
    const email = typeof record.email === "string" ? record.email.trim() : "";
    const message =
        typeof record.message === "string" ? record.message.trim() : "";

    if (
        !isValidLeadName(name) ||
        !isLeadContactType(contactType) ||
        (contactType === "phone" && !isValidLeadPhone(phone)) ||
        (contactType === "email" && !isValidLeadEmail(email)) ||
        !isValidLeadMessage(message)
    ) {
        return { success: false, reason: "invalid_fields" };
    }

    return {
        success: true,
        lead: {
            name,
            contactType,
            phone: contactType === "phone" ? phone : null,
            email: contactType === "email" ? email : null,
            message: message || null,
            locale: isLocale(record.locale) ? record.locale : null,
        },
    };
}
