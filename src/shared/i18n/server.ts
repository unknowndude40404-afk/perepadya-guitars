import { notFound } from "next/navigation";
import { locale as localeParam } from "next/root-params";

import { isLocale, type Locale } from "./config";
import { getDictionary } from "./dictionaries";

export async function getLocale(): Promise<Locale> {
    const value = await localeParam();

    if (!isLocale(value)) {
        notFound();
    }

    return value;
}

export async function getI18n() {
    const locale = await getLocale();

    return { locale, dict: getDictionary(locale) };
}
