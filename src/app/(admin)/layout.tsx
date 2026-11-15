import type { Metadata } from "next";

import { SITE_NAME, SITE_URL } from "@/shared/config/site";

import "../globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: {
        default: `Адмінка | ${SITE_NAME}`,
        template: `%s | Адмінка ${SITE_NAME}`,
    },
    robots: { index: false, follow: false },
};

export default function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="uk">
            <body>
                <div className="min-h-screen bg-[var(--page-bg)]">
                    {children}
                </div>
            </body>
        </html>
    );
}
