import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
    title: "404 — Page not found",
    robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
    return (
        <html lang="en">
            <body>
                <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--page-bg)] px-4 text-center text-[var(--text-primary)]">
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] opacity-60">
                        404
                    </p>

                    <h1 className="text-[clamp(28px,5vw,48px)] font-bold">
                        Page not found
                    </h1>

                    <Link
                        href="/"
                        className="inline-flex rounded-full bg-[var(--text-primary)] px-6 py-3 text-sm font-semibold text-[var(--bg-primary)]"
                    >
                        Home
                    </Link>
                </main>
            </body>
        </html>
    );
}
