"use client";

import {
    PRODUCT_STATUSES,
    PRODUCT_STATUS_LABELS,
    type ProductStatus,
} from "@/entities/product/config/status.config";
import { Checkbox } from "@/shared/ui/checkbox";
import { Input } from "@/shared/ui/input";
import { RadioGroup } from "@/shared/ui/radio-group";

const STATUS_OPTIONS = PRODUCT_STATUSES.map((status) => ({
    value: status,
    label: PRODUCT_STATUS_LABELS[status],
}));

type ProductAvailabilityProps = {
    status: ProductStatus;
    gtin: string;
    isHidden: boolean;
    onStatusChange: (status: ProductStatus) => void;
    onGtinChange: (gtin: string) => void;
    onIsHiddenChange: (value: boolean) => void;
};

export function ProductAvailability({
    status,
    gtin,
    isHidden,
    onStatusChange,
    onGtinChange,
    onIsHiddenChange,
}: ProductAvailabilityProps) {
    return (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
            <div className="mb-5 text-sm font-medium text-[var(--text-primary)]">
                Наявність
            </div>

            <RadioGroup
                name="product-status"
                options={STATUS_OPTIONS}
                value={status}
                onChange={onStatusChange}
            />

            <div className="mt-5 max-w-[320px]">
                <label className="mb-2 block text-sm text-[var(--text-secondary)]">
                    Штрихкод
                </label>

                <Input
                    type="text"
                    inputMode="numeric"
                    value={gtin}
                    onChange={(event) => onGtinChange(event.target.value)}
                    placeholder="Необов'язково"
                />
            </div>

            <div className="mt-5">
                <Checkbox
                    label="Приховати з вітрини"
                    checked={isHidden}
                    onChange={(event) => onIsHiddenChange(event.target.checked)}
                />
            </div>
        </div>
    );
}
