"use client";

import { SegmentedControl } from "@/shared/ui/segmented-control";

export type EditMode = "manual" | "json";

const OPTIONS = [
    { value: "manual", label: "Вручну" },
    { value: "json", label: "Через JSON" },
] as const;

type EditModeSwitchProps = {
    value: EditMode;
    onChange: (mode: EditMode) => void;
    /** Blocks switching away from JSON while it has errors. */
    jsonError?: string | null;
};

export function EditModeSwitch({
    value,
    onChange,
    jsonError,
}: EditModeSwitchProps) {
    const locked = value === "json" && Boolean(jsonError);

    return (
        <div className="flex flex-col gap-2">
            <SegmentedControl
                options={OPTIONS}
                value={value}
                onChange={(mode) => {
                    if (!locked) {
                        onChange(mode);
                    }
                }}
                ariaLabel="Спосіб заповнення"
                className="w-full sm:w-[320px]"
            />

            {locked ? (
                <span className="text-xs text-[var(--error-primary)]">
                    Виправте помилку в JSON, щоб повернутися до форми
                </span>
            ) : null}
        </div>
    );
}
