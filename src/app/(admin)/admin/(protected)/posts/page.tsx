import { AdminPosts } from "@/views/admin/posts";

export default async function AdminPostsPage({
    searchParams,
}: PageProps<"/admin/posts">) {
    return <AdminPosts searchParams={await searchParams} />;
}