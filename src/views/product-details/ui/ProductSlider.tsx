"use client";

import Image from "next/image";
import {
    useMemo,
    useState,
} from "react";
import Lightbox from "yet-another-react-lightbox";
import Inline from "yet-another-react-lightbox/plugins/inline";
import { useI18n } from "@/providers/locale-provider";
import { formatMessage } from "@/shared/i18n";

type ProductSliderProps = {
    images: string[];
};

const INLINE_SLIDER_IMAGE_PADDING = "32px";
const INLINE_SLIDER_SPACING = "0px";

const lightboxInlineStyles = {
    root: {
        ["--yarl__color_backdrop" as string]:
            "transparent",
    },
    container: {
        backgroundColor: "transparent",
    },
};

const getThumbnailClassName = (
    isActive: boolean,
) => {
    const baseClassName =
        "relative flex h-20 w-20 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl bg-[var(--card-bg)] p-2 transition md:h-[88px] md:w-[88px]";

    if (isActive) {
        return `${baseClassName} border border-[var(--accent-primary)] shadow-[var(--shadow-primary)]`;
    }

    return `${baseClassName} border border-[var(--border-primary)] opacity-70 hover:opacity-100`;
};

export function ProductSlider({
    images,
}: ProductSliderProps) {
    const { dict } = useI18n();
    const [index, setIndex] = useState(0);
    const [isOpen, setIsOpen] =
        useState(false);

    const slides = useMemo(
        () =>
            images.map((image) => ({
                src: image,
                width: 900,
                height: 900,
            })),
        [images],
    );

    const hasSlides = slides.length > 0;

    const hasMultipleSlides =
        slides.length > 1;

    const activeIndex = hasSlides
        ? Math.min(
            index,
            slides.length - 1,
        )
        : 0;

    const layoutClassName =
        hasMultipleSlides
            ? "grid gap-4 md:grid-cols-[88px_minmax(0,1fr)] md:items-stretch"
            : "block";

    const sliderClassName =
        hasMultipleSlides
            ? "order-1 min-w-0 md:order-2"
            : "min-w-0";

    if (!hasSlides) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-[28px] border border-[var(--border-primary)] bg-[var(--card-bg)] text-sm text-[var(--text-secondary)]">
                No image
            </div>
        );
    }

    return (
        <>
            <div className={layoutClassName}>
                {hasMultipleSlides ? (
                    <div className="order-2 min-w-0 md:order-1">
                        <div className="flex gap-3 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
                            {slides.map(
                                (
                                    slide,
                                    slideIndex,
                                ) => {
                                    const isActive =
                                        slideIndex ===
                                        activeIndex;

                                    return (
                                        <button
                                            key={`${slide.src}-${slideIndex}`}
                                            type="button"
                                            onClick={() =>
                                                setIndex(
                                                    slideIndex,
                                                )
                                            }
                                            className={getThumbnailClassName(
                                                isActive,
                                            )}
                                            aria-label={formatMessage(dict.product.showImage, { index: slideIndex + 1 })}
                                        >
                                            <Image
                                                src={slide.src}
                                                alt=""
                                                fill
                                                sizes="88px"
                                                className="object-contain p-2"
                                            />
                                        </button>
                                    );
                                },
                            )}
                        </div>
                    </div>
                ) : null}

                <div
                    className={
                        sliderClassName
                    }
                >
                    <div className="overflow-hidden rounded-[28px] border border-[var(--border-primary)] bg-[var(--card-bg)] shadow-[var(--shadow-primary)]">
                        <Lightbox
                            plugins={[Inline]}
                            slides={slides}
                            index={activeIndex}
                            on={{
                                view: ({
                                    index:
                                    currentIndex,
                                }) => {
                                    setIndex(
                                        currentIndex,
                                    );
                                },
                                click: ({
                                    index:
                                    currentIndex,
                                }) => {
                                    setIndex(
                                        currentIndex,
                                    );
                                    setIsOpen(true);
                                },
                            }}
                            inline={{
                                className:
                                    "aspect-square w-full",
                            }}
                            carousel={{
                                imageFit: "contain",
                                padding:
                                    INLINE_SLIDER_IMAGE_PADDING,
                                spacing:
                                    INLINE_SLIDER_SPACING,
                            }}
                            toolbar={{
                                buttons: [],
                            }}
                            styles={
                                lightboxInlineStyles
                            }
                            render={{
                                buttonPrev: () => null,
                                buttonNext: () => null,
                            }}
                        />
                    </div>
                </div>
            </div>

            <Lightbox
                open={isOpen}
                close={() =>
                    setIsOpen(false)
                }
                slides={slides}
                index={activeIndex}
                on={{
                    view: ({
                        index: currentIndex,
                    }) => {
                        setIndex(currentIndex);
                    },
                }}
                carousel={{
                    imageFit: "contain",
                }}
                render={{
                    buttonPrev:
                        hasMultipleSlides
                            ? undefined
                            : () => null,
                    buttonNext:
                        hasMultipleSlides
                            ? undefined
                            : () => null,
                }}
            />
        </>
    );
}