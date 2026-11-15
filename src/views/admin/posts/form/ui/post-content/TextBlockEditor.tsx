"use client";

import type { TextBlock } from "@/entities/post";
import { PostRichTextEditor } from "./PostRichTextEditor";

type TextBlockEditorProps = {
    block: TextBlock;
    onChange: (block: TextBlock) => void;
    invalid?: boolean;
};

export function TextBlockEditor({
    block,
    onChange,
    invalid = false,
}: TextBlockEditorProps) {
    return (
        <PostRichTextEditor
            invalid={invalid}
            value={block.content}
            onChange={(content) => onChange({ ...block, content })}
        />
    );
}