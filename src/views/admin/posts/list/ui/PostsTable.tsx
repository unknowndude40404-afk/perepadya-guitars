"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Table, Column } from "@/shared/ui/table";
import { Dropdown } from "@/shared/ui/dropdown";
import { DotsButton } from "@/shared/ui/dots-button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { formatDate } from "@/shared/lib/format";

import type { AdminPostListItem } from "../api/get-admin-posts";

const PostColumn = Column<AdminPostListItem>;

const STATUS_LABELS = {
    draft: "Чернетка",
    published: "Опубліковано",
} as const;

const menuItemClass =
    "block w-full cursor-pointer px-4 py-2 text-left text-sm transition hover:bg-[var(--bg-secondary)]";

type PostsTableProps = {
    posts: AdminPostListItem[];
};

export function PostsTable({ posts }: PostsTableProps) {
    const router = useRouter();

    const [postToDelete, setPostToDelete] =
        useState<AdminPostListItem | null>(null);

    const [isDeleting, setIsDeleting] = useState(false);

    const [deleteError, setDeleteError] = useState<string | null>(null);

    const [togglingId, setTogglingId] = useState<string | null>(null);

    const [actionError, setActionError] = useState<string | null>(null);

    function openPost(id: string) {
        router.push(`/admin/posts/${id}`);
    }

    async function toggleStatus(post: AdminPostListItem) {
        if (togglingId) {
            return;
        }

        setTogglingId(post.id);
        setActionError(null);

        try {
            const response = await fetch(`/api/admin/posts/${post.id}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status: post.status === "published" ? "draft" : "published",
                }),
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                setActionError("Не вдалося змінити статус");

                return;
            }

            router.refresh();
        } catch (error) {
            console.error("TOGGLE POST STATUS ERROR", error);

            setActionError("Не вдалося змінити статус");
        } finally {
            setTogglingId(null);
        }
    }

    async function handleDelete() {
        if (!postToDelete || isDeleting) {
            return;
        }

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const response = await fetch(`/api/admin/posts/${postToDelete.id}`, {
                method: "DELETE",
            });

            const result = await response.json().catch(() => null);

            if (!response.ok || !result?.success) {
                setDeleteError("Не вдалося видалити пост");

                return;
            }

            setPostToDelete(null);
            router.refresh();
        } catch (error) {
            console.error("DELETE POST ERROR", error);

            setDeleteError("Не вдалося видалити пост");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            {actionError ? (
                <div className="mb-4 text-sm text-[var(--error-primary)]">
                    {actionError}
                </div>
            ) : null}

            <Table
                data={posts}
                getRowKey={(post) => post.id}
                emptyMessage="Постів не знайдено"
                onRowClick={(post) => openPost(post.id)}
            >
                <PostColumn title="Назва" className="font-medium">
                    {(post) => post.title}
                </PostColumn>

                <PostColumn title="Статус" align="center">
                    {(post) => (
                        <span
                            className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${post.status === "published"
                                ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
                                : "bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                                }`}
                        >
                            {STATUS_LABELS[post.status]}
                        </span>
                    )}
                </PostColumn>

                <PostColumn
                    title="Оновлено"
                    align="center"
                    className="whitespace-nowrap"
                >
                    {(post) => (
                        <span className="text-[var(--text-secondary)]">
                            {formatDate(post.updatedAt)}
                        </span>
                    )}
                </PostColumn>

                <PostColumn title="Дії" align="center" width="100px">
                    {(post) => (
                        <div
                            onClick={(event) => event.stopPropagation()}
                            className="flex justify-center"
                        >
                            <Dropdown
                                menuClassName="w-[200px]"
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
                                                openPost(post.id);
                                            }}
                                            className={`${menuItemClass} text-[var(--text-primary)]`}
                                        >
                                            Редагувати
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                close();
                                                toggleStatus(post);
                                            }}
                                            className={`${menuItemClass} text-[var(--text-primary)]`}
                                        >
                                            {post.status === "published"
                                                ? "Зняти з публікації"
                                                : "Опублікувати"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                close();
                                                setDeleteError(null);
                                                setPostToDelete(post);
                                            }}
                                            className={`${menuItemClass} text-[var(--error-primary)]`}
                                        >
                                            Видалити
                                        </button>
                                    </>
                                )}
                            </Dropdown>
                        </div>
                    )}
                </PostColumn>
            </Table>

            <ConfirmDialog
                open={postToDelete !== null}
                title="Видалити пост?"
                description={
                    deleteError ??
                    (postToDelete
                        ? `«${postToDelete.title}» буде видалено. Цю дію не можна скасувати.`
                        : undefined)
                }
                confirmLabel="Видалити"
                destructive
                loading={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => {
                    setPostToDelete(null);
                    setDeleteError(null);
                }}
            />
        </>
    );
}