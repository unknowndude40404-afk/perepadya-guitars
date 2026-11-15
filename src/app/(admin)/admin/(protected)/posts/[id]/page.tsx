import { notFound } from "next/navigation";

import { PostForm, getAdminPost } from "@/views/admin/posts";

export default async function EditPostPage({
    params,
}: PageProps<"/admin/posts/[id]">) {
    const { id } = await params;

    const result = await getAdminPost(id);

    if (!result.success) {
        notFound();
    }

    return <PostForm post={result.post} />;
}