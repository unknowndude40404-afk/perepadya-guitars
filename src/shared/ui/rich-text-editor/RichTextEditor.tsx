"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import type { Editor } from "@tiptap/react";
import type { ReactNode } from "react";

import { Dropdown } from "@/shared/ui/dropdown";

type ToolbarButtonProps = {
    onClick: () => void;
    active?: boolean;
    label: string;
    children: ReactNode;
};

function ToolbarButton({
    onClick,
    active = false,
    label,
    children,
}: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            title={label}
            className={`flex size-8 cursor-pointer items-center justify-center rounded-lg text-sm transition ${active
                    ? "bg-[var(--accent-subtle)] text-[var(--accent-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                }`}
        >
            {children}
        </button>
    );
}

type MenuItemProps = {
    onClick: () => void;
    destructive?: boolean;
    children: ReactNode;
};

function MenuItem({
    onClick,
    destructive = false,
    children,
}: MenuItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`block w-full cursor-pointer px-4 py-2.5 text-left text-sm transition hover:bg-[var(--bg-secondary)] ${destructive
                    ? "text-[var(--error-primary)]"
                    : "text-[var(--text-primary)]"
                }`}
        >
            {children}
        </button>
    );
}

type ToolbarProps = {
    editor: Editor;
};

function Toolbar({ editor }: ToolbarProps) {
    const inTable = editor.isActive("table");

    return (
        <div className="flex flex-wrap items-center gap-1 border-b border-[var(--border-primary)] p-2">
            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleBold().run()
                }
                active={editor.isActive("bold")}
                label="Жирний"
            >
                <span className="font-bold">B</span>
            </ToolbarButton>

            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleItalic().run()
                }
                active={editor.isActive("italic")}
                label="Курсив"
            >
                <span className="italic">I</span>
            </ToolbarButton>

            <span className="mx-1 h-5 w-px bg-[var(--border-primary)]" />

            <ToolbarButton
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .toggleHeading({ level: 3 })
                        .run()
                }
                active={editor.isActive("heading", { level: 3 })}
                label="Заголовок"
            >
                <span className="font-semibold">H</span>
            </ToolbarButton>

            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleBulletList().run()
                }
                active={editor.isActive("bulletList")}
                label="Маркований список"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="size-4"
                >
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                </svg>
            </ToolbarButton>

            <ToolbarButton
                onClick={() =>
                    editor.chain().focus().toggleOrderedList().run()
                }
                active={editor.isActive("orderedList")}
                label="Нумерований список"
            >
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="size-4"
                >
                    <path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4v-2l2-2h-2" />
                </svg>
            </ToolbarButton>

            <span className="mx-1 h-5 w-px bg-[var(--border-primary)]" />

            <Dropdown
                menuClassName="w-[220px]"
                renderTrigger={({ toggle }) => (
                    <ToolbarButton
                        onClick={toggle}
                        active={inTable}
                        label="Таблиця"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4"
                        >
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M3 9h18M3 15h18M9 3v18" />
                        </svg>
                    </ToolbarButton>
                )}
            >
                {({ close }) =>
                    inTable ? (
                        <>
                            <MenuItem
                                onClick={() => {
                                    close();

                                    editor
                                        .chain()
                                        .focus()
                                        .addRowAfter()
                                        .run();
                                }}
                            >
                                Додати рядок
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    close();

                                    editor
                                        .chain()
                                        .focus()
                                        .addColumnAfter()
                                        .run();
                                }}
                            >
                                Додати стовпець
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    close();

                                    editor
                                        .chain()
                                        .focus()
                                        .deleteRow()
                                        .run();
                                }}
                                destructive
                            >
                                Видалити рядок
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    close();

                                    editor
                                        .chain()
                                        .focus()
                                        .deleteColumn()
                                        .run();
                                }}
                                destructive
                            >
                                Видалити стовпець
                            </MenuItem>

                            <MenuItem
                                onClick={() => {
                                    close();

                                    editor
                                        .chain()
                                        .focus()
                                        .deleteTable()
                                        .run();
                                }}
                                destructive
                            >
                                Видалити таблицю
                            </MenuItem>
                        </>
                    ) : (
                        <MenuItem
                            onClick={() => {
                                close();

                                editor
                                    .chain()
                                    .focus()
                                    .insertTable({
                                        rows: 3,
                                        cols: 3,
                                        withHeaderRow: true,
                                    })
                                    .run();
                            }}
                        >
                            Вставити таблицю
                        </MenuItem>
                    )
                }
            </Dropdown>
        </div>
    );
}

type RichTextEditorProps = {
    value: string;
    onChange: (value: string) => void;
};

export function RichTextEditor({
    value,
    onChange,
}: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,

        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [3],
                },
            }),

            TableKit.configure({
                table: {
                    resizable: false,
                },
            }),
        ],

        content: value,

        editorProps: {
            attributes: {
                class:
                    "min-h-[180px] px-4 py-3 text-sm leading-6 text-[var(--text-primary)] outline-none",
            },
        },

        onUpdate: ({ editor: instance }) => {
            const html = instance.getHTML();

            onChange(html === "<p></p>" ? "" : html);
        },
    });

    if (!editor) {
        return (
            <div className="min-h-[230px] rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)]" />
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] transition-all duration-300 focus-within:border-[var(--border-hover)]">
            <Toolbar editor={editor} />

            <EditorContent editor={editor} />
        </div>
    );
}