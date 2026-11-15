"use client";

import type { TextBlock } from "@/entities/post";
import { PostRichTextEditor } from "./PostRichTextEditor";

type TextBlockEditorProps = {
    block: TextBlock;
    onChange: (block: TextBlock) => void;
};

export function TextBlockEditor({ block, onChange }: TextBlockEditorProps) {
    return (
        <PostRichTextEditor
            value={block.content}
            onChange={(content) => onChange({ ...block, content })}
        />
    );
}