"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { useAdminUI } from "@/providers/admin-ui-provider";
import { Button } from "@/shared/ui/button";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

export function AdminHeader() {
    const router = useRouter();

    const {
        isSidebarCollapsed,
        openSidebar,
    } = useAdminUI();

    const [isConfirmOpen, setIsConfirmOpen] =
        useState(false);

    const [isLoggingOut, setIsLoggingOut] =
        useState(false);

    async function handleLogout() {
        if (isLoggingOut) {
            return;
        }

        setIsLoggingOut(true);

        try {
            await fetch("/api/admin/logout", {
                method: "POST",
            });
        } catch (error) {
            console.error("ADMIN LOGOUT ERROR", error);
        }

        router.replace("/admin/login");
        router.refresh();
    }

    return (
        <>
            <header className="sticky top-0 z-30 flex h-[73px] w-full items-center justify-between border-b border-[var(--border-primary)] bg-[var(--bg-primary)] px-6">
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={openSidebar}
                        aria-label="Відкрити меню"
                        className={`h-10 w-10 cursor-pointer flex-col items-center justify-center gap-[4px] rounded-[10px] border border-[var(--border-primary)] transition hover:border-[var(--border-hover)] flex ${isSidebarCollapsed
                                ? "lg:flex"
                                : "lg:hidden"
                            }`}
                    >
                        <span className="h-[2px] w-[18px] bg-[var(--icon-primary)]" />
                        <span className="h-[2px] w-[18px] bg-[var(--icon-primary)]" />
                        <span className="h-[2px] w-[18px] bg-[var(--icon-primary)]" />
                    </button>
                </div>

                <Button
                    type="button"
                    onClick={() => setIsConfirmOpen(true)}
                    aria-label="Вийти"
                    title="Вийти"
                    className="h-10 w-10 rounded-xl border border-[var(--border-primary)] text-[var(--text-primary)] hover:border-[var(--border-hover)] hover:text-[var(--accent-primary)]"
                >
                    <Image
                        src="/icons/logout.svg"
                        alt=""
                        width={25}
                        height={25}
                    />
                </Button>
            </header>

            <ConfirmDialog
                open={isConfirmOpen}
                title="Вийти з адмінпанелі?"
                description="Для повернення потрібно буде увійти знову."
                confirmLabel="Вийти"
                loading={isLoggingOut}
                onConfirm={handleLogout}
                onCancel={() => setIsConfirmOpen(false)}
            />
        </>
    );
}