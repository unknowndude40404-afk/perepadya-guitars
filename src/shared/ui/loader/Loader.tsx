type Props = {
    className?: string;
};

export function Loader({
    className = "",
}: Props) {
    return (
        <div
            className={`size-10 animate-spin rounded-full border-4 border-[var(--border-primary)] border-t-[var(--accent-primary)] ${className}`}
        />
    );
}