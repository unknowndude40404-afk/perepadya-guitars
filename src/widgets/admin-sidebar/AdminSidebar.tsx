"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { useAdminUI } from "@/providers/admin-ui-provider";

const ADMIN_LINKS = [
    {
        href: "/admin/products",
        label: "Товари",
    },
    {
        href: "/admin/posts",
        label: "Блог",
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    const {
        isSidebarCollapsed,
        isMobileSidebarOpen,
        closeSidebar,
        closeMobileSidebar,
    } = useAdminUI();

    return (
        <>
            <div
                onClick={closeMobileSidebar}
                className={`fixed inset-0 z-40 bg-[var(--overlay-bg)] backdrop-blur-[4px] transition-opacity duration-300 lg:hidden ${isMobileSidebarOpen
                    ? "opacity-100"
                    : "pointer-events-none opacity-0"
                    }`}
            />

            <aside
                className={`fixed left-0 top-0 z-50 h-full w-[280px] shrink-0 overflow-hidden border-r border-[var(--border-primary)] bg-[var(--bg-primary)] transition-all duration-300 max-[576px]:w-full lg:sticky lg:z-0 lg:h-screen lg:translate-x-0 ${isMobileSidebarOpen
                    ? "translate-x-0"
                    : "-translate-x-full"
                    } ${isSidebarCollapsed
                        ? "lg:w-0 lg:border-r-0"
                        : "lg:w-[260px]"
                    }`}
            >
                <div className="flex h-[73px] items-center justify-between border-b border-[var(--border-primary)] px-4">
                    <Image
                        src="/icons/logo.svg"
                        alt="Perepadya Guitars"
                        width={78}
                        height={36}
                        className="h-[36px] w-auto"
                    />

                    <button
                        type="button"
                        onClick={closeSidebar}
                        aria-label="Згорнути меню"
                        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] border border-[var(--border-primary)] text-lg text-[var(--text-primary)] transition hover:border-[var(--border-hover)] hover:text-[var(--accent-primary)]"
                    >
                        ✕
                    </button>
                </div>

                <nav className="flex flex-col">
                    {ADMIN_LINKS.map((link) => {
                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMobileSidebar}
                                className={`relative flex items-center whitespace-nowrap px-4 py-3 text-sm transition ${isActive
                                    ? "bg-[var(--accent-subtle)] font-medium text-[var(--accent-primary)]"
                                    : "text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
                                    }`}
                            >
                                {isActive ? (
                                    <span className="absolute left-0 top-0 h-full w-[3px] bg-[var(--accent-primary)]" />
                                ) : null}

                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}