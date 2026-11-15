export const PRODUCT_STATUSES = ["in_stock", "on_order"] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const DEFAULT_PRODUCT_STATUS: ProductStatus = "in_stock";

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
    in_stock: "В наявності",
    on_order: "Під замовлення",
};

export function isProductStatus(value: unknown): value is ProductStatus {
    return (
        typeof value === "string" &&
        (PRODUCT_STATUSES as readonly string[]).includes(value)
    );
}
