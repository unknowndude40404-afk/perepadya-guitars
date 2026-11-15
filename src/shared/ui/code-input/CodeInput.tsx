"use client";

import {
    useEffect,
    useRef,
    type ClipboardEvent,
    type KeyboardEvent,
} from "react";

type CodeInputProps = {
    value: string;
    length?: number;
    invalid?: boolean;
    autoFocus?: boolean;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
};

export function CodeInput({
    value,
    length = 4,
    invalid = false,
    autoFocus = false,
    onChange,
    onComplete,
}: CodeInputProps) {
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (autoFocus) {
            inputsRef.current[0]?.focus();
        }
    }, [autoFocus]);

    function setValue(next: string) {
        const clean = next.replace(/\D/g, "").slice(0, length);

        onChange(clean);

        if (clean.length === length) {
            onComplete?.(clean);
        }
    }

    function handleChange(index: number, raw: string) {
        const digit = raw.replace(/\D/g, "").slice(-1);

        if (!digit) {
            return;
        }

        const chars = value.split("");

        chars[index] = digit;

        const next = chars.join("").slice(0, length);

        setValue(next);

        if (index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(
        index: number,
        event: KeyboardEvent<HTMLInputElement>,
    ) {
        if (event.key === "Backspace") {
            event.preventDefault();

            const chars = value.split("");

            if (chars[index]) {
                chars[index] = "";

                setValue(chars.join(""));

                return;
            }

            if (index > 0) {
                chars[index - 1] = "";

                setValue(chars.join(""));

                inputsRef.current[index - 1]?.focus();
            }

            return;
        }

        if (event.key === "ArrowLeft" && index > 0) {
            event.preventDefault();

            inputsRef.current[index - 1]?.focus();

            return;
        }

        if (event.key === "ArrowRight" && index < length - 1) {
            event.preventDefault();

            inputsRef.current[index + 1]?.focus();
        }
    }

    function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
        event.preventDefault();

        const pasted = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);

        if (!pasted) {
            return;
        }

        setValue(pasted);

        const nextIndex = Math.min(pasted.length, length - 1);

        inputsRef.current[nextIndex]?.focus();
    }

    return (
        <div className="flex justify-center gap-3">
            {Array.from({ length }).map((_, index) => (
                <input
                    key={index}
                    ref={(element) => {
                        inputsRef.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={1}
                    value={value[index] ?? ""}
                    onChange={(event) =>
                        handleChange(index, event.target.value)
                    }
                    onKeyDown={(event) =>
                        handleKeyDown(index, event)
                    }
                    onPaste={handlePaste}
                    onFocus={(event) => event.target.select()}
                    className={`size-14 rounded-xl border bg-[var(--bg-primary)] text-center text-xl font-semibold text-[var(--text-primary)] outline-none transition-all duration-300 ${invalid
                            ? "border-[var(--error-primary)]"
                            : "border-[var(--border-primary)] focus:border-[var(--accent-primary)]"
                        }`}
                />
            ))}
        </div>
    );
}