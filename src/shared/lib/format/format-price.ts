export const CURRENCY = {
    code: "UAH",
    symbol: "₴",
} as const;

export function formatPrice(value: number) {
    return `${value.toLocaleString("uk-UA")} ${CURRENCY.symbol}`;
}