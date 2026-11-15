import { AdminProducts } from "@/views/admin/products";

type AdminProductsPageProps = {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminProductsPage({
    searchParams,
}: AdminProductsPageProps) {
    const resolvedSearchParams = await searchParams;

    return (
        <AdminProducts
            searchParams={resolvedSearchParams}
        />
    );
}