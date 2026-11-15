"use client";

import dynamic from "next/dynamic";
import { useState, type ReactNode } from "react";
import { z } from "zod";

const CodeEditor = dynamic(() => import("./CodeEditor"), {
    ssr: false,
    loading: () => (
        <div className="min-h-[360px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)]" />
    ),
});

const ukErrors = z.locales.uk();

function formatPath(path: PropertyKey[]) {
    return path
        .map((part) =>
            typeof part === "number" ? `[${part}]` : `.${String(part)}`,
        )
        .join("")
        .replace(/^\./, "");
}

export function formatSchemaError(error: z.ZodError) {
    const issue = error.issues[0];

    if (!issue) {
        return "Некоректні дані";
    }

    const path = formatPath(issue.path);

    return path ? `${path}: ${issue.message}` : issue.message;
}

type JsonEditorProps<T> = {
    /** Data shown when the editor opens. Later changes are not pulled in. */
    initialValue: unknown;
    /** Checks the shape of the JSON and turns it into form data. */
    schema: z.ZodType<T>;
    /** Called with parsed data on every valid edit. */
    onChange: (data: T) => void;
    /** Called with an error text while the JSON is invalid, null when fixed. */
    onErrorChange?: (error: string | null) => void;
    /** Builds a prompt for an AI chat from the current JSON. */
    getAiPrompt?: (json: string) => string;
    hint?: ReactNode;
};

type CopyTarget = "json" | "prompt";

export function stringifyJson(value: unknown) {
    return JSON.stringify(value, null, 2);
}

/**
 * Edits form data as JSON. Valid edits are applied to the form right away,
 * so switching back to the manual form shows the same data.
 */
export function JsonEditor<T>({
    initialValue,
    schema,
    onChange,
    onErrorChange,
    getAiPrompt,
    hint,
}: JsonEditorProps<T>) {
    const [text, setText] = useState(() => stringifyJson(initialValue));
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState<CopyTarget | null>(null);

    function reportError(next: string | null) {
        setError(next);
        onErrorChange?.(next);
    }

    function handleChange(next: string) {
        setText(next);

        let parsed: unknown;

        try {
            parsed = JSON.parse(next);
        } catch (parseError) {
            reportError(
                `Неправильний JSON: ${parseError instanceof Error ? parseError.message : "синтаксична помилка"}`,
            );

            return;
        }

        const result = schema.safeParse(parsed, {
            error: ukErrors.localeError,
        });

        if (!result.success) {
            reportError(formatSchemaError(result.error));

            return;
        }

        reportError(null);
        onChange(result.data);
    }

    async function copy(target: CopyTarget) {
        const value =
            target === "prompt" && getAiPrompt ? getAiPrompt(text) : text;

        try {
            await navigator.clipboard.writeText(value);
            setCopied(target);
            window.setTimeout(() => setCopied(null), 2000);
        } catch {
            setCopied(null);
        }
    }

    const buttonClass =
        "h-9 cursor-pointer rounded-xl border border-[var(--border-primary)] px-3 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--border-hover)]";

    return (
        <div className="rounded-2xl border border-[var(--border-primary)] bg-[var(--card-bg)] p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">
                    JSON
                </span>

                <div className="flex flex-wrap gap-2">
                    {getAiPrompt ? (
                        <button
                            type="button"
                            onClick={() => copy("prompt")}
                            className={buttonClass}
                        >
                            {copied === "prompt"
                                ? "Скопійовано"
                                : "Скопіювати промпт для ШІ"}
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={() => copy("json")}
                        className={buttonClass}
                    >
                        {copied === "json" ? "Скопійовано" : "Скопіювати JSON"}
                    </button>
                </div>
            </div>

            {hint ? (
                <div className="mb-4 text-xs leading-5 text-[var(--text-secondary)]">
                    {hint}
                </div>
            ) : null}

            <div
                className={`overflow-hidden rounded-2xl border ${error
                    ? "border-[var(--error-primary)]"
                    : "border-[var(--border-primary)]"
                    }`}
            >
                <CodeEditor value={text} onChange={handleChange} />
            </div>

            <div
                className={`mt-3 text-xs ${error
                    ? "text-[var(--error-primary)]"
                    : "text-[var(--text-secondary)]"
                    }`}
            >
                {error ??
                    "JSON правильний — зміни вже застосовані до форми"}
            </div>
        </div>
    );
}
