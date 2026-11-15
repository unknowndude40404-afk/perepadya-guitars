type CountBadgeProps = {
    count: number;
    className?: string;
};

export function CountBadge({
    count,
    className = "",
}: CountBadgeProps) {
    if (count <= 0) {
        return null;
    }

    const label = count > 99 ? "99+" : String(count);

    return (
        <span
            className={`pointer-events-none absolute flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--accent-primary)] px-1 text-[10px] font-semibold leading-none text-black ${className}`}
        >
            {label}
        </span>
    );
}