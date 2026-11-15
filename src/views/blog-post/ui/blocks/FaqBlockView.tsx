import type { FaqBlock } from "@/entities/post";

type FaqBlockViewProps = {
    block: FaqBlock;
};

export function FaqBlockView({ block }: FaqBlockViewProps) {
    const items = block.items.filter(
        (item) => item.question.trim() && item.answer.trim(),
    );

    if (items.length === 0) {
        return null;
    }

    return (
        <section className="overflow-hidden rounded-2xl border border-[var(--border-primary)]">
            {items.map((item) => (
                <details
                    key={item.id}
                    className="group border-b border-[var(--border-primary)] last:border-b-0"
                >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-[12px] px-[20px] py-[16px] text-[16px] font-semibold text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
                        {item.question}

                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-5 shrink-0 text-[var(--text-secondary)] transition-transform duration-200 group-open:rotate-180"
                            aria-hidden
                        >
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </summary>

                    <p className="whitespace-pre-line px-[20px] pb-[16px] text-[15px] leading-7 text-[var(--text-secondary)]">
                        {item.answer}
                    </p>
                </details>
            ))}
        </section>
    );
}