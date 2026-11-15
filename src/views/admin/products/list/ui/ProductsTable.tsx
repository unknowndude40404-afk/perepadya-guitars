"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Table, Column } from "@/shared/ui/table";
import { Dropdown } from "@/shared/ui/dropdown";
import { DotsButton } from "@/shared/ui/dots-button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { PRODUCT_STATUS_LABELS } from "@/entities/product/config/status.config";

import type { AdminProductListItem } from "../api/get-admin-products";

const ProductColumn = Column<AdminProductListItem>;

type ProductsTableProps = {
    products: AdminProductListItem[];
};

export function ProductsTable({
    products,
}: ProductsTableProps) {
    const router = useRouter();

    const [productToDelete, setProductToDelete] = useState<AdminProductListItem | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);

    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [togglingId, setTogglingId] = useState<string | null>(null);

    function openProduct(id: string) {
        router.push(`/admin/products/${id}`);
    }

    async function toggleVisibility(
        product: AdminProductListItem,
    ) {
        if (togglingId) {
            return;
        }

        setTogglingId(product.id);

        try {
            const response = await fetch(
                `/api/admin/products/${product.id}/visibility`,
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        isHidden: !product.isHidden,
                    }),
                },
            );

            const result = await response.json();

            if (response.ok && result.success) {
                router.refresh();
            }
        } catch (error) {
            console.error(
                "TOGGLE VISIBILITY ERROR",
                error,
            );
        } finally {
            setTogglingId(null);
        }
    }

    async function handleDelete() {
        if (!productToDelete || isDeleting) {
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const response = await fetch(
                `/api/admin/products/${productToDelete.id}`,
                {
                    method: "DELETE",
                },
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                setDeleteError("Не вдалося видалити товар");

                return;
            }

            setProductToDelete(null);
            router.refresh();
        } catch (error) {
            console.error("DELETE PRODUCT ERROR", error);

            setDeleteError("Не вдалося видалити товар");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <Table
                data={products}
                getRowKey={(product) => product.id}
                emptyMessage="Товарів поки немає"
                onRowClick={(product) =>
                    openProduct(product.id)
                }
            >
                <ProductColumn
                    title="Назва"
                    align="center"
                    className="font-medium"
                >
                    {(product) => (
                        <span
                            className={
                                product.isHidden
                                    ? "text-[var(--text-secondary)] opacity-60"
                                    : ""
                            }
                        >
                            {product.name}
                        </span>
                    )}
                </ProductColumn>

                <ProductColumn
                    title="Наявність"
                    align="center"
                    className="whitespace-nowrap"
                >
                    {(product) => PRODUCT_STATUS_LABELS[product.status]}
                </ProductColumn>

                <ProductColumn
                    title="Дії"
                    align="center"
                    width="100px"
                >
                    {(product) => (
                        <div
                            onClick={(event) =>
                                event.stopPropagation()
                            }
                            className="flex justify-center"
                        >
                            <Dropdown
                                menuClassName="w-[180px]"
                                renderTrigger={({ toggle }) => (
                                    <DotsButton
                                        onClick={toggle}
                                        aria-label="Дії"
                                        className="size-8 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                                    />
                                )}
                            >
                                {({ close }) => (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                close();
                                                openProduct(
                                                    product.id,
                                                );
                                            }}
                                            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)]"
                                        >
                                            Редагувати
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                close();
                                                toggleVisibility(
                                                    product,
                                                );
                                            }}
                                            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)]"
                                        >
                                            {product.isHidden
                                                ? "Показати"
                                                : "Приховати"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                close();
                                                setDeleteError(null);
                                                setProductToDelete(
                                                    product,
                                                );
                                            }}
                                            className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-[var(--error-primary)] transition hover:bg-[var(--bg-secondary)]"
                                        >
                                            Видалити
                                        </button>
                                    </>
                                )}
                            </Dropdown>
                        </div>
                    )}
                </ProductColumn>
            </Table>

            <ConfirmDialog
                open={productToDelete !== null}
                title="Видалити товар?"
                description={
                    deleteError ??
                    (productToDelete
                        ? `${productToDelete.name} буде видалено. Цю дію не можна скасувати.`
                        : undefined)
                }
                confirmLabel="Видалити"
                destructive
                loading={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => {
                    setProductToDelete(null);
                    setDeleteError(null);
                }}
            />
        </>
    );
}