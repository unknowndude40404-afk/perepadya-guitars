"use client";

import type { ChangeEvent } from "react";

/** International phone number: digits after "+", country code included (E.164, max 15). */
const MAX_DIGITS = 15;

type PhoneInputProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    invalid?: boolean;
};

export function PhoneInput({
    value,
    onChange,
    placeholder = "380 67 123 4567",
    className = "",
    invalid = false,
}: PhoneInputProps) {
    function handleChange(
        event: ChangeEvent<HTMLInputElement>,
    ) {
        const digits = event.target.value
            .replace(/\D/g, "")
            .replace(/^00/, "");

        onChange(digits.slice(0, MAX_DIGITS));
    }

    return (
        <div
            className={`
        flex
        w-full
        overflow-hidden
        rounded-2xl
        border
        bg-[var(--bg-primary)]
        transition-all
        duration-300

        ${invalid
                    ? `
              border-[var(--error-primary)]
              hover:border-[var(--error-primary)]
              focus-within:border-[var(--error-primary)]
            `
                    : `
              border-[var(--border-primary)]
              hover:border-[var(--border-hover)]
              focus-within:border-[var(--border-hover)]
              focus-within:shadow-[var(--shadow-primary)]
            `
                }

        ${className}
      `}
        >
            <div
                className="
          flex
          shrink-0
          items-center
          border-r
          border-[var(--border-primary)]
          px-4
          text-[16px]
          font-medium
          text-[var(--text-primary)]
        "
            >
                +
            </div>

            <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                aria-invalid={invalid}
                className="
          min-w-0
          flex-1
          bg-transparent
          px-4
          py-[13px]
          text-[16px]
          text-[var(--text-primary)]
          outline-none
          placeholder:text-[var(--text-secondary)]
        "
            />
        </div>
    );
}