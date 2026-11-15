import type { ProductDetails } from "@/entities/product/model/product.types";
import { ButtonLink } from "@/shared/ui/button-link";
import { Wrapper } from "@/shared/ui/wrapper";

import { localizePath, type Dictionary, type Locale } from "@/shared/i18n";

type ProductInfoProps = {
    product: ProductDetails;
    locale: Locale;
    dict: Dictionary;
};

export function ProductInfo({
    product,
    locale,
    dict,
}: ProductInfoProps) {
    return (
        <div className="space-y-4">
            <Wrapper className="p-6">
                <h1 className="text-[22px] font-semibold leading-tight text-[var(--text-primary)]">
                    {product.name}
                </h1>
            </Wrapper>

            <div className="flex flex-wrap gap-3">
                <Wrapper className="px-4 py-3">
                    <div className="text-base font-semibold text-[var(--text-primary)]">
                        {dict.product.status[product.status]}
                    </div>
                </Wrapper>

                {product.sku ? (
                    <Wrapper className="w-fit px-4 py-3">
                        <div className="text-base font-medium text-[var(--text-primary)]">
                            {product.sku}
                        </div>
                    </Wrapper>
                ) : null}
            </div>

            <ButtonLink
                href={localizePath(locale, "/order")}
                className="w-full rounded-[28px] border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-6 py-4 text-base font-semibold text-black hover:opacity-90 active:scale-[0.99]"
            >
                {dict.product.order}
            </ButtonLink>
        </div>
    );
}
