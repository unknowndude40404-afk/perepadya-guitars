import { getHomeBreadcrumb } from "@/shared/config/breadcrumbs";
import { localizePath } from "@/shared/i18n";
import { getI18n } from "@/shared/i18n/server";
import {
    Breadcrumbs,
    BreadcrumbsJsonLd,
    type BreadcrumbItem,
} from "@/shared/ui/breadcrumbs";

import { OrderForm } from "./OrderForm";

export async function OrderPage() {
    const { locale, dict } = await getI18n();

    const breadcrumbs: BreadcrumbItem[] = [
        getHomeBreadcrumb(locale, dict),
        { label: dict.order.title, href: localizePath(locale, "/order") },
    ];

    return (
        <section className="flex w-full flex-col items-center gap-[32px] px-4 py-6 sm:px-6">
            <BreadcrumbsJsonLd items={breadcrumbs} />

            <Breadcrumbs items={breadcrumbs} className="w-full" />

            <div className="flex flex-col items-center gap-[8px] text-center">
                <h1 className="text-3xl font-semibold text-[var(--text-primary)]">
                    {dict.order.title}
                </h1>

                <p className="text-[16px] text-[var(--text-secondary)] max-[576px]:text-[14px]">
                    {dict.order.subtitle}
                </p>
            </div>

            <OrderForm />
        </section>
    );
}
