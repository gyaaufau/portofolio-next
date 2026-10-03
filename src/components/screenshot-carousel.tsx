"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppScreenshot } from "@/data/types";
import { screenshotDimensions } from "@/lib/screenshots";

function ScreenshotSlide({ shot }: { shot: AppScreenshot }) {
  const [dimensions, setDimensions] = useState(() => screenshotDimensions(shot.width, shot.height));
  const aspectRatio = dimensions.width ? `${dimensions.width}/${dimensions.height}` : "9/16";
  return (
    <div className="editorial-carousel-shot" style={{ aspectRatio }}>
      <Image src={shot.src} alt={shot.alt} fill sizes="(max-width: 768px) 70vw, 320px" className="object-contain"
        onLoad={(event) => {
          if (!dimensions.width) setDimensions(screenshotDimensions(event.currentTarget.naturalWidth, event.currentTarget.naturalHeight));
        }} />
    </div>
  );
}

export function ScreenshotCarousel({ screenshots, appTitle }: { screenshots: AppScreenshot[]; appTitle: string }) {
  const ref = useRef<HTMLDivElement>(null);
  if (!screenshots.length) return <div className="editorial-carousel-empty">Screenshots for {appTitle} are coming soon.</div>;
  const scroll = (left: boolean) => ref.current?.scrollBy({ left: left ? -360 : 360, behavior: "smooth" });
  return (
    <section className="editorial-carousel" aria-label={`${appTitle} screenshots`}>
      <div ref={ref} className="editorial-carousel-track">
        {screenshots.map((shot) => <ScreenshotSlide key={`${shot.id}:${shot.src}:${shot.width}:${shot.height}`} shot={shot} />)}
      </div>
      {screenshots.length > 1 && <div className="editorial-carousel-controls"><button type="button" onClick={() => scroll(true)} aria-label="Previous screenshots"><ChevronLeft size={18} /></button><button type="button" onClick={() => scroll(false)} aria-label="Next screenshots"><ChevronRight size={18} /></button></div>}
    </section>
  );
}
