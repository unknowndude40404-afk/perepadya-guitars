type RadioOption<T extends string> = {
    value: T;
    label: string;
};

type RadioGroupProps<T extends string> = {
    name: string;
    options: readonly RadioOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
};

export function RadioGroup<T extends string>({
    name,
    options,
    value,
    onChange,
    className = "",
}: RadioGroupProps<T>) {
    return (
        <div className={`space-y-4 ${className}`}>
            {options.map((option) => {
                const isSelected = value === option.value;

                return (
                    <label
                        key={option.value}
                        className="flex cursor-pointer items-center gap-3"
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={isSelected}
                            onChange={() => onChange(option.value)}
                            className="sr-only"
                        />

                        <span
                            className={`
                  flex
                  size-5
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  transition-all
                  duration-200
                  ${isSelected
                                    ? "border-[var(--accent-primary)]"
                                    : "border-[var(--border-primary)]"
                                }
                `}
                        >
                            {isSelected ? (
                                <span className="size-2.5 rounded-full bg-[var(--accent-primary)]" />
                            ) : null}
                        </span>

                        <span className="text-base text-[var(--text-primary)]">
                            {option.label}
                        </span>
                    </label>
                );
            })}
        </div>
    );
}