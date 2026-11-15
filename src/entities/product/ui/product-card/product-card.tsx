import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/entities/product/model/product.types";
import { localizePath, type Locale } from "@/shared/i18n";

type ProductCardProps = {
    product: Product;
    locale: Locale;
    statusLabel: string;
    className?: string;
};

export function ProductCard({
    product,
    locale,
    statusLabel,
    className = "",
}: ProductCardProps) {
    return (
        <Link
            href={localizePath(locale, `/product/${product.slug}`)}
            className={`flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] transition-transform duration-300 hover:-translate-y-1 ${className}`}
        >
            <div className="relative block aspect-square overflow-hidden bg-[var(--bg-secondary)]">
                <Image
                    src={
                        product.images[0] ||
                        "https://placehold.co/600x800"
                    }
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 576px) 50vw, (max-width: 992px) 33vw, 25vw"
                />
            </div>

            <div className="flex flex-1 flex-col p-3 sm:p-4">
                <div className="line-clamp-2 text-center text-sm font-medium text-[var(--text-primary)] sm:text-base">
                    {product.name}
                </div>

                <div className="mt-auto pt-3 text-center sm:pt-4">
                    <span className="text-xs text-[var(--text-secondary)] sm:text-sm">
                        {statusLabel}
                    </span>
                </div>
            </div>
        </Link>
    );
}
