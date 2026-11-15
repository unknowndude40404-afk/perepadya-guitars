const TIME_ZONE = "Europe/Kyiv";

export function formatDate(value: string, dateLocale = "uk-UA") {
    return new Date(value).toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: TIME_ZONE,
    });
}

export function formatDateTime(value: string) {
    return new Date(value).toLocaleString("uk-UA", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: TIME_ZONE,
    });
}