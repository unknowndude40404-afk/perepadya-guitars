import type { CtaBlock } from "@/entities/post";
import { localizePath } from "@/shared/i18n";
import { getI18n } from "@/shared/i18n/server";
import { ButtonLink } from "@/shared/ui/button-link";

type CtaBlockViewProps = {
    block: CtaBlock;
};

export async function CtaBlockView({ block }: CtaBlockViewProps) {
    const { locale, dict } = await getI18n();

    return (
        <section className="flex flex-col items-center gap-[12px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] px-[24px] py-[32px] text-center">
            {block.title.trim() ? (
                <h2 className="text-[22px] font-bold text-[var(--text-primary)]">
                    {block.title}
                </h2>
            ) : null}

            {block.text.trim() ? (
                <p className="max-w-[520px] whitespace-pre-line text-[16px] leading-7 text-[var(--text-secondary)]">
                    {block.text}
                </p>
            ) : null}

            <ButtonLink
                href={localizePath(locale, "/order")}
                className="mt-[8px] rounded-[28px] border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-[28px] py-[14px] text-[16px] font-semibold text-black hover:opacity-90 active:scale-[0.99]"
            >
                {block.buttonLabel.trim() || dict.blog.ctaDefault}
            </ButtonLink>
        </section>
    );
}