"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/ui/button";

import type { AdminProductDetails } from "../api/get-admin-product";

import {
    ProductTexts,
    getProductSlug,
    getProductTextErrors,
    hasProductTextErrors,
    toProductTextsDraft,
    toTranslationsPayload,
    type ProductTextsDraft,
} from "./product-texts";
import { LOCALES } from "@/shared/i18n/config";
import { ProductAvailability } from "./product-availability";
import {
    DEFAULT_PRODUCT_STATUS,
    type ProductStatus,
} from "@/entities/product/config/status.config";
import {
    ProductImages,
    getImageUrls,
    toExistingImages,
    uploadNewImages,
    type ProductImageDraft,
} from "./product-images";

type ProductFormProps = {
    product?: AdminProductDetails;
};

export function ProductForm({ product }: ProductFormProps) {
    const router = useRouter();

    const isEdit = Boolean(product);

    const [texts, setTexts] = useState<ProductTextsDraft>(() =>
        toProductTextsDraft(product?.translations),
    );

    const [isHidden, setIsHidden] = useState(product?.isHidden ?? false);

    const [status, setStatus] = useState<ProductStatus>(
        product?.status ?? DEFAULT_PRODUCT_STATUS,
    );

    const [gtin, setGtin] = useState(product?.gtin ?? "");

    const [images, setImages] = useState<ProductImageDraft[]>(() =>
        toExistingImages(product?.images ?? []),
    );

    const [submitAttempted, setSubmitAttempted] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const slug = getProductSlug(texts);

    const textsInvalid =
        !slug ||
        LOCALES.some((locale) =>
            hasProductTextErrors(getProductTextErrors(locale, texts[locale])),
        );

    const imagesInvalid = images.length === 0;

    const isFormValid =
        !textsInvalid &&
        !imagesInvalid;

    async function handleSubmit() {
        if (isSubmitting) {
            return;
        }

        setSubmitAttempted(true);
        setError(null);

        if (!isFormValid) {
            return;
        }

        setIsSubmitting(true);

        try {
            const uploaded = await uploadNewImages(images);

            setImages(uploaded.images);

            if (uploaded.error) {
                setError(uploaded.error);

                return;
            }

            const payload = {
                translations: toTranslationsPayload(texts),
                isHidden,
                images: getImageUrls(uploaded.images),
                status,
                gtin: gtin.trim() || null,
            };

            const response = await fetch(
                isEdit
                    ? `/api/admin/products/${product?.id}`
                    : "/api/admin/products",
                {
                    method: isEdit ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                },
            );

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                setError(
                    result?.reason === "slug_taken"
                        ? "Товар з такою англійською назвою вже існує"
                        : result?.reason === "invalid_images"
                            ? "Некоректні зображення — оновіть сторінку і спробуйте ще раз"
                            : "Не вдалося зберегти товар",
                );

                return;
            }

            router.push("/admin/products");
        } catch (fetchError) {
            console.error("SAVE PRODUCT ERROR", fetchError);

            setError("Не вдалося зберегти товар");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold text-[var(--text-primary)]">
                {isEdit ? "Редагувати товар" : "Новий товар"}
            </h1>

            <div className="flex flex-col gap-6">
                <ProductTexts
                    texts={texts}
                    slug={slug}
                    showErrors={submitAttempted}
                    onChange={setTexts}
                />

                <ProductImages
                    images={images}
                    invalid={submitAttempted && imagesInvalid}
                    onChange={setImages}
                />

                <ProductAvailability
                    status={status}
                    gtin={gtin}
                    isHidden={isHidden}
                    onStatusChange={setStatus}
                    onGtinChange={setGtin}
                    onIsHiddenChange={setIsHidden}
                />
            </div>

            {submitAttempted && !isFormValid ? (
                <div className="mt-6 text-sm text-[var(--error-primary)]">
                    Заповніть обов&apos;язкові поля — вони підсвічені червоним
                </div>
            ) : null}

            {error ? (
                <div className="mt-6 text-sm text-[var(--error-primary)]">
                    {error}
                </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
                <Button
                    type="button"
                    onClick={() => router.push("/admin/products")}
                    disabled={isSubmitting}
                    className="h-12 rounded-xl border border-[var(--border-primary)] px-6 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--border-hover)] active:scale-[0.99]"
                >
                    Скасувати
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    aria-disabled={!isFormValid}
                    loading={isSubmitting}
                    className="h-12 rounded-xl bg-[var(--accent-primary)] px-6 text-sm font-medium text-white hover:bg-[var(--accent-hover)] active:scale-[0.99]"
                >
                    Зберегти
                </Button>
            </div>
        </div>
    );
}