import type { CalloutBlock, CalloutVariant } from "@/entities/post";
import { getI18n } from "@/shared/i18n/server";

const VARIANT_CLASSES: Record<CalloutVariant, { box: string; accent: string }> = {
    info: {
        box: "border-[var(--callout-info-border)] bg-[var(--callout-info-bg)]",
        accent: "text-[var(--callout-info-accent)]",
    },
    tip: {
        box: "border-[var(--callout-tip-border)] bg-[var(--callout-tip-bg)]",
        accent: "text-[var(--callout-tip-accent)]",
    },
    warning: {
        box: "border-[var(--callout-warning-border)] bg-[var(--callout-warning-bg)]",
        accent: "text-[var(--callout-warning-accent)]",
    },
};

function CalloutIcon({ variant }: { variant: CalloutVariant }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5 shrink-0"
            aria-hidden
        >
            {variant === "info" ? (
                <>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5M12 8h.01" />
                </>
            ) : null}

            {variant === "tip" ? (
                <path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" />
            ) : null}

            {variant === "warning" ? (
                <>
                    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                    <path d="M12 9v4M12 17h.01" />
                </>
            ) : null}
        </svg>
    );
}

type CalloutBlockViewProps = {
    block: CalloutBlock;
};

export async function CalloutBlockView({ block }: CalloutBlockViewProps) {
    const { dict } = await getI18n();

    if (!block.text.trim()) {
        return null;
    }

    const classes = VARIANT_CLASSES[block.variant];

    return (
        <aside className={`flex gap-[12px] rounded-2xl border p-[20px] ${classes.box}`}>
            <span className={`mt-[2px] ${classes.accent}`}>
                <CalloutIcon variant={block.variant} />
            </span>

            <div className="flex flex-col gap-[4px]">
                <span className={`text-[14px] font-semibold ${classes.accent}`}>
                    {dict.blog.callout[block.variant]}
                </span>

                <p className="whitespace-pre-line text-[16px] leading-7 text-[var(--text-primary)]">
                    {block.text}
                </p>
            </div>
        </aside>
    );
}