export const SITE_NAME = "Perepadya Guitars";

export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

/** Footer social links. An entry with an empty href is hidden. */
export const SITE_SOCIALS = [
    { name: "instagram", label: "Instagram", href: "https://www.instagram.com/perepadya_guitars" },
    { name: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@perepadya_guitars" },
    { name: "threads", label: "Threads", href: "https://www.threads.com/@perepadya_guitars" },
] as const;

const SCHEMA_URL = "https://schema.org";

export const SCHEMA = {
    context: SCHEMA_URL,
} as const;