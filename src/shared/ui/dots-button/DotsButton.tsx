import type { ButtonHTMLAttributes } from "react";

type DotsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    orientation?: "horizontal" | "vertical";
};

export function DotsButton({
    orientation = "horizontal",
    className = "",
    ...props
}: DotsButtonProps) {
    return (
        <button
            {...props}
            type="button"
            className={`flex cursor-pointer items-center justify-center gap-[3px] transition-all duration-300 ${orientation === "vertical" ? "flex-col" : ""
                } ${className}`}
        >
            <span className="size-[3px] shrink-0 rounded-full bg-current" />
            <span className="size-[3px] shrink-0 rounded-full bg-current" />
            <span className="size-[3px] shrink-0 rounded-full bg-current" />
        </button>
    );
}