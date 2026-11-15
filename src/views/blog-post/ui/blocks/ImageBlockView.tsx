import Image from "next/image";

import type { ImageBlock } from "@/entities/post";

const MAX_WIDTH = 800;
const MAX_HEIGHT = 720;

function getDisplayWidth(width: number, height: number): number {
    const scale = Math.min(1, MAX_WIDTH / width, MAX_HEIGHT / height);

    return Math.round(width * scale);
}

type ImageBlockViewProps = {
    block: ImageBlock;
};

export function ImageBlockView({ block }: ImageBlockViewProps) {
    if (!block.url) {
        return null;
    }

    if (block.width && block.height) {
        const displayWidth = getDisplayWidth(block.width, block.height);

        return (
            <Image
                src={block.url}
                alt={block.alt}
                width={block.width}
                height={block.height}
                sizes={`(max-width: ${displayWidth + 48}px) 100vw, ${displayWidth}px`}
                style={{ width: displayWidth }}
                className="mx-auto block h-auto max-w-full rounded-2xl border border-[var(--border-primary)]"
            />
        );
    }

    return (
        <Image
            src={block.url}
            alt={block.alt}
            width={1600}
            height={900}
            sizes="(max-width: 848px) 100vw, 800px"
            className="mx-auto block h-auto w-full max-w-[800px] rounded-2xl border border-[var(--border-primary)]"
        />
    );
}