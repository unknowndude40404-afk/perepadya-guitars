import { Wrapper } from "@/shared/ui/wrapper";

type ProductDescriptionProps = {
    description: string | null;
};

export function ProductDescription({
    description,
}: ProductDescriptionProps) {
    if (!description) {
        return null;
    }

    return (
        <Wrapper className="p-6">
            <div
                className="rich-text text-base leading-7 text-[var(--text-secondary)]"
                dangerouslySetInnerHTML={{ __html: description }}
            />
        </Wrapper>
    );
}