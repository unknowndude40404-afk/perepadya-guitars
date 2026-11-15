import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GoogleAnalytics } from "@next/third-parties/google";

import { LocaleProvider } from "@/providers/locale-provider";
import { UIProvider } from "@/providers/ui-provider";
import { getDictionary, isLocale, LOCALE_META, LOCALES } from "@/shared/i18n";
import { getBaseMetadata } from "@/shared/i18n/metadata";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";

import "../globals.css";

export function generateStaticParams() {
    return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
    const { locale } = await params;

    if (!isLocale(locale)) {
        return {};
    }

    return getBaseMetadata(locale, getDictionary(locale));
}

export default async function LocaleLayout({
    children,
    params,
}: LayoutProps<"/[locale]">) {
    const { locale } = await params;

    if (!isLocale(locale)) {
        notFound();
    }

    const dict = getDictionary(locale);
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    return (
        <html lang={LOCALE_META[locale].htmlLang}>
            <body>
                <LocaleProvider locale={locale} dict={dict}>
                    <UIProvider>
                        <div className="flex min-h-screen flex-col">
                            <Header />
                            <Sidebar />

                            <main className="flex w-full flex-1 bg-[var(--page-bg)]">
                                {children}
                            </main>

                            <Footer />
                        </div>
                    </UIProvider>
                </LocaleProvider>

                {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
            </body>
        </html>
    );
}
