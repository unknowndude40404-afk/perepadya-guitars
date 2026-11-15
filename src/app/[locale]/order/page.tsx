import type { Metadata } from "next";

import { SITE_NAME } from "@/shared/config/site";
import { absoluteUrl, getAlternates } from "@/shared/i18n/metadata";
import { getI18n } from "@/shared/i18n/server";

import { OrderPage } from "@/views/order";

export async function generateMetadata(): Promise<Metadata> {
    const { locale, dict } = await getI18n();

    return {
        title: dict.order.title,
        description: dict.order.description,
        alternates: getAlternates({ locale, path: "/order" }),
        openGraph: {
            type: "website",
            title: `${dict.order.title} | ${SITE_NAME}`,
            description: dict.order.description,
            url: absoluteUrl(locale, "/order"),
        },
    };
}

export default function OrderRoute() {
    return <OrderPage />;
}
