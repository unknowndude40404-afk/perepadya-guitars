"use client";

import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";

const extensions = [
    json(),
    linter(jsonParseLinter()),
    lintGutter(),
    EditorView.lineWrapping,
    EditorView.theme({
        "&": { backgroundColor: "var(--bg-primary)", fontSize: "13px" },
        ".cm-gutters": {
            backgroundColor: "var(--bg-primary)",
            borderRight: "1px solid var(--border-primary)",
        },
        ".cm-content": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" },
    }),
];

type CodeEditorProps = {
    value: string;
    onChange: (value: string) => void;
};

/** JSON code editor with highlighting and syntax error markers. Client-only. */
export default function CodeEditor({ value, onChange }: CodeEditorProps) {
    return (
        <CodeMirror
            value={value}
            onChange={onChange}
            theme="dark"
            extensions={extensions}
            minHeight="360px"
            maxHeight="70vh"
            basicSetup={{ foldGutter: true, highlightActiveLine: true }}
        />
    );
}
