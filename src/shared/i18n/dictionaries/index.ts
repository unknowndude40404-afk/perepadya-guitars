import type { Locale } from "../config";

import cs from "./cs.json";
import de from "./de.json";
import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import hu from "./hu.json";
import it from "./it.json";
import nl from "./nl.json";
import pl from "./pl.json";
import pt from "./pt.json";
import ro from "./ro.json";
import tr from "./tr.json";
import uk from "./uk.json";

export type Dictionary = typeof en;

const DICTIONARIES: Record<Locale, Dictionary> = {
    en,
    uk,
    de,
    fr,
    it,
    es,
    pl,
    ro,
    nl,
    tr,
    pt,
    hu,
    cs,
};

export function getDictionary(locale: Locale): Dictionary {
    return DICTIONARIES[locale];
}

export function formatMessage(
    template: string,
    values: Record<string, string | number>,
) {
    return template.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in values ? String(values[key]) : match,
    );
}
