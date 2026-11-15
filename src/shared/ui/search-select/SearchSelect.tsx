"use client";

import {
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { useClickOutside } from "@/shared/lib/hooks/use-click-outside";

export type SearchSelectOption = {
    label: string;
    value: string;
};

type SearchSelectProps = {
    options: readonly SearchSelectOption[];
    value?: string;
    onChange: (value: string) => void;
    onSearch?: (query: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    loading?: boolean;
    invalid?: boolean;
};

export function SearchSelect({
    options,
    value,
    onChange,
    onSearch,
    placeholder = "Оберіть значення",
    className = "",
    disabled = false,
    loading = false,
    invalid = false,
}: SearchSelectProps) {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [open, setOpen] = useState(false);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [query, setQuery] = useState("");

    useClickOutside(rootRef, () => {
        setOpen(false);
        setQuery("");
    });

    useLayoutEffect(() => {
        if (!open || !menuRef.current || !rootRef.current) {
            setOpenUpwards(false);

            return;
        }

        const menuRect = menuRef.current.getBoundingClientRect();
        const triggerRect = rootRef.current.getBoundingClientRect();

        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;

        const needsSpace = menuRect.height + 8;

        setOpenUpwards(
            spaceBelow < needsSpace && spaceAbove > spaceBelow,
        );
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setOpen(false);
                setQuery("");
            }
        }

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const selectedOption = options.find(
        (option) => option.value === value,
    );

    const filteredOptions = useMemo(() => {
        if (onSearch) {
            return options;
        }

        const normalizedQuery = query
            .trim()
            .toLocaleLowerCase("uk-UA");

        if (!normalizedQuery) {
            return options;
        }

        return options.filter((option) =>
            option.label
                .toLocaleLowerCase("uk-UA")
                .includes(normalizedQuery),
        );
    }, [options, query, onSearch]);

    function handleSelect(option: SearchSelectOption) {
        onChange(option.value);
        setQuery("");
        setOpen(false);
    }

    return (
        <div ref={rootRef} className={`relative w-full ${className}`}>
            <input
                type="text"
                value={open ? query : selectedOption?.label ?? ""}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setOpen(true);
                    onSearch?.(event.target.value);
                }}
                onFocus={() => {
                    if (!disabled) {
                        setOpen(true);
                    }
                }}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
                aria-invalid={invalid}
                className={`w-full rounded-2xl border bg-[var(--bg-primary)] px-4 py-[13px] text-sm text-[var(--text-primary)] outline-none transition-all duration-300 placeholder:text-[var(--text-secondary)] disabled:cursor-not-allowed disabled:opacity-50 ${invalid
                        ? "border-[var(--error-primary)] hover:border-[var(--error-primary)] focus:border-[var(--error-primary)]"
                        : "border-[var(--border-primary)] hover:border-[var(--border-hover)] focus:border-[var(--border-hover)] focus:shadow-[var(--shadow-primary)]"
                    }`}
            />

            {open && !disabled ? (
                <div
                    ref={menuRef}
                    className={`absolute left-0 z-50 w-full overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-dropdown)] shadow-[var(--shadow-primary)] backdrop-blur ${openUpwards
                            ? "bottom-[calc(100%+8px)]"
                            : "top-[calc(100%+8px)]"
                        }`}
                >
                    <div className="max-h-72 overflow-y-auto">
                        {loading ? (
                            <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                                Завантаження...
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const active = option.value === value;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            handleSelect(option)
                                        }
                                        className="flex w-full cursor-pointer items-center justify-between gap-4 px-4 py-3 text-left text-sm text-[var(--text-primary)] transition-colors duration-200 hover:bg-[var(--card-bg-hover)]"
                                    >
                                        <span>{option.label}</span>

                                        {active ? (
                                            <span className="text-[var(--accent-primary)]">
                                                ✓
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="px-4 py-3 text-sm text-[var(--text-secondary)]">
                                Нічого не знайдено
                            </div>
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}