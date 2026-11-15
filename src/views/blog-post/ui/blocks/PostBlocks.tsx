import type { PostBlock } from "@/entities/post";

import { CalloutBlockView } from "./CalloutBlockView";
import { CtaBlockView } from "./CtaBlockView";
import { FaqBlockView } from "./FaqBlockView";
import { ImageBlockView } from "./ImageBlockView";
import { RichText } from "./RichText";

type PostBlocksProps = {
    blocks: PostBlock[];
};

export function PostBlocks({ blocks }: PostBlocksProps) {
    return (
        <div className="flex flex-col gap-[32px]">
            {blocks.map((block) => {
                switch (block.type) {
                    case "text":
                        return <RichText key={block.id} content={block.content} />;

                    case "image":
                        return <ImageBlockView key={block.id} block={block} />;

                    case "callout":
                        return <CalloutBlockView key={block.id} block={block} />;

                    case "cta":
                        return <CtaBlockView key={block.id} block={block} />;

                    case "faq":
                        return <FaqBlockView key={block.id} block={block} />;
                }
            })}
        </div>
    );
}