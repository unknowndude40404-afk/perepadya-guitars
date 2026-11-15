import Image from "next/image";

import { SITE_SOCIALS } from "@/shared/config/site";
import { getI18n } from "@/shared/i18n/server";

const socials = SITE_SOCIALS.filter((social) => social.href);

export async function Footer() {
  const { dict } = await getI18n();

  return (
    <footer
      className="
    border-t border-[var(--border-primary)]
    bg-[var(--bg-primary)]
    px-6 py-6
    max-md:py-5
    max-md:pb-[max(20px,env(safe-area-inset-bottom))]
  "
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
        <span
          className="
            cursor-default
            text-[14px]
            font-bold
            tracking-[0.28em]
            text-[var(--text-primary)]
            transition-colors duration-300
            hover:text-[var(--accent-primary)]
          "
        >
          PEREPADYA GUITARS
        </span>

        {socials.length > 0 && (
          <div className="flex flex-col items-center gap-[8px]">
            <span className="text-[14px] font-medium text-[var(--text-secondary)]">
              {dict.footer.socials}
            </span>

            <nav className="flex items-center gap-[16px]">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="transition-opacity duration-200 hover:opacity-80"
                >
                  <Image
                    src={`/icons/${social.name}.svg`}
                    alt=""
                    width={36}
                    height={36}
                  />
                </a>
              ))}
            </nav>
          </div>
        )}

        <span
          className="
            text-[10px]
            tracking-[0.14em]
            text-[var(--text-secondary)]
            opacity-70
          "
        >
          © 2026 {dict.footer.rights}
        </span>
      </div>
    </footer>
  );
}