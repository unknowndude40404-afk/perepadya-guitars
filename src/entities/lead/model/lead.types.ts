import type { Locale } from "@/shared/i18n/config";

export const LEAD_CONTACT_TYPES = ["phone", "email"] as const;

export type LeadContactType = (typeof LEAD_CONTACT_TYPES)[number];

export const LEAD_LIMITS = {
    name: 100,
    email: 254,
    message: 1000,
} as const;

export type Lead = {
    name: string;
    contactType: LeadContactType;
    phone: string | null;
    email: string | null;
    message: string | null;
    locale: Locale | null;
};
