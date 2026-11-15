"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useSwipeable } from "react-swipeable";

import { useI18n } from "@/providers/locale-provider";
import { SIDEBAR_ID, useUI } from "@/providers/ui-provider";

const LINK_CLASS =
  "rounded-[8px] px-3 py-2 text-[14px] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent-primary)] transition";

export function Sidebar() {
  const { isSidebarOpen, closeSidebar } = useUI();
  const { dict, href } = useI18n();

  const links = [
    { path: "/", label: dict.nav.home },
    { path: "/catalog", label: dict.nav.showcase },
    { path: "/blog", label: dict.nav.blog },
    { path: "/about", label: dict.nav.about },
    { path: "/order", label: dict.nav.order },
  ];

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: closeSidebar,
    trackMouse: false,
    preventScrollOnSwipe: false,
    delta: 60,
  });

  useEffect(() => {
    if (!isSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSidebarOpen, closeSidebar]);

  return (
    <>
      <div
        onClick={closeSidebar}
        className={`fixed inset-0 z-40 bg-[var(--overlay-bg)] backdrop-blur-[4px] transition-opacity duration-300 ${isSidebarOpen
          ? "opacity-100"
          : "pointer-events-none opacity-0"
          }`}
      />

      <aside
        {...swipeHandlers}
        id={SIDEBAR_ID}
        aria-label={dict.nav.menu}
        className={`fixed left-0 top-0 z-50 h-full w-[300px] bg-[var(--sidebar-bg)] backdrop-blur-[12px] border-r border-[var(--border-primary)] text-[var(--text-primary)] shadow-[var(--shadow-primary)] transition-[translate,visibility] duration-300 max-[576px]:w-full ${isSidebarOpen
          ? "visible translate-x-0"
          : "invisible -translate-x-full"
          }`}
      >
        <div className="flex items-center justify-end px-5 py-4">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeSidebar}
            aria-label={dict.nav.closeMenu}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-[var(--shadow-primary)] transition-transform duration-200 active:scale-95"
          >
            <Image
              src="/icons/close.svg"
              alt=""
              width={24}
              height={24}
            />
          </button>
        </div>

        <nav className="flex flex-col gap-[6px] p-4">
          {links.map((link) => (
            <Link
              key={link.path}
              href={href(link.path)}
              onClick={closeSidebar}
              className={LINK_CLASS}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}