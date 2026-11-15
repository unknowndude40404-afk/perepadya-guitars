"use client";

import {
    type ReactNode,
    useEffect,
    useRef,
} from "react";

type CarouselProps = {
    children: ReactNode;
    className?: string;
};

export function Carousel({
    children,
    className = "",
}: CarouselProps) {
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const carousel = carouselRef.current;

        if (!carousel) {
            return;
        }

        const handleWheel = (event: WheelEvent) => {
            if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) {
                return;
            }

            const maxScrollLeft =
                carousel.scrollWidth - carousel.clientWidth;

            if (maxScrollLeft <= 0) {
                return;
            }

            const scrollingRight = event.deltaY > 0;
            const scrollingLeft = event.deltaY < 0;

            const canScrollRight =
                carousel.scrollLeft < maxScrollLeft;
            const canScrollLeft =
                carousel.scrollLeft > 0;

            if (
                (scrollingRight && !canScrollRight) ||
                (scrollingLeft && !canScrollLeft)
            ) {
                return;
            }

            event.preventDefault();

            carousel.scrollBy({
                left: event.deltaY,
                behavior: "auto",
            });
        };

        carousel.addEventListener(
            "wheel",
            handleWheel,
            {
                passive: false,
            },
        );

        return () => {
            carousel.removeEventListener(
                "wheel",
                handleWheel,
            );
        };
    }, []);

    return (
        <div
            ref={carouselRef}
            className={`flex gap-4 overflow-x-auto overscroll-x-contain pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${className}`}
        >
            {children}
        </div>
    );
}