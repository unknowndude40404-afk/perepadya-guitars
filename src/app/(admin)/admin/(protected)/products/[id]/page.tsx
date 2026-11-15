import { notFound } from "next/navigation";
import {
    ProductForm,
    getAdminProduct,
} from "@/views/admin/products";

type EditProductPageProps = {
    params: Promise<{ id: string }>;
};

export default async function EditProductPage({
    params,
}: EditProductPageProps) {
    const { id } = await params;

    const productResult = await getAdminProduct(id);

    if (!productResult.success) {
        notFound();
    }

    return <ProductForm product={productResult.product} />;
}
