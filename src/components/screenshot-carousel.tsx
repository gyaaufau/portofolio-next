"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppScreenshot } from "@/data/types";

type ScreenshotCarouselProps = {
  screenshots: AppScreenshot[];
  appTitle: string;
};

export function ScreenshotCarousel({ screenshots, appTitle }: ScreenshotCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (screenshots.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative group">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
        style={{ scrollbarWidth: "none" }}
      >
        {screenshots.map((s) => (
          <div
            key={s.id}
            className="snap-center shrink-0 first:pl-0 last:pr-0"
          >
            <img
              src={s.src}
              alt={s.alt}
              width={s.width}
              height={s.height}
              className="rounded-xl h-64 w-auto object-cover border border-border"
            />
          </div>
        ))}
      </div>

      {screenshots.length > 2 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-card/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 size-8 rounded-full bg-card/80 border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" />
          </button>
        </>
      )}
    </div>
  );
}
