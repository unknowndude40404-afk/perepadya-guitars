"use client";

import Link from "next/link";
import Image from "next/image";
import { LanguageSwitcher } from "@/features/language-switcher";
import { useI18n } from "@/providers/locale-provider";
import { SIDEBAR_ID, useUI } from "@/providers/ui-provider";

export function Header() {
  const { isSidebarOpen, openSidebar } = useUI();
  const { dict, href } = useI18n();

  return (
    <header className="sticky top-0 z-50 flex w-full justify-between border-b border-[var(--border-primary)] bg-[var(--bg-primary)] px-[24px] py-[16px] pt-[max(16px,env(safe-area-inset-top))]">
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          onClick={openSidebar}
          aria-label={dict.nav.openMenu}
          aria-expanded={isSidebarOpen}
          aria-controls={SIDEBAR_ID}
          className="flex h-[40px] w-[40px] cursor-pointer flex-col items-center justify-center gap-[4px] rounded-[10px] border border-[var(--border-primary)] transition hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-primary)]"
        >
          <span className="h-[2px] w-[18px] bg-[var(--icon-primary)]" />
          <span className="h-[2px] w-[18px] bg-[var(--icon-primary)]" />
          <span className="h-[2px] w-[18px] bg-[var(--icon-primary)]" />
        </button>

        <Link href={href("/")} className="flex items-center">
          <Image
            src="/icons/logo.svg"
            alt="Perepadya Guitars"
            width={104}
            height={48}
            priority
            className="h-[48px] w-auto"
          />
        </Link>
      </div>

      <div className="flex items-center gap-[12px]">
        <LanguageSwitcher />
      </div>
    </header>
  );
}