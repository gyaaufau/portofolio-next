"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppScreenshot } from "@/data/types";

export function ScreenshotCarousel({ screenshots, appTitle }: { screenshots: AppScreenshot[]; appTitle: string }) {
  const ref = useRef<HTMLDivElement>(null);
  if (!screenshots.length) return <div className="editorial-carousel-empty">Screenshots for {appTitle} are coming soon.</div>;
  const scroll = (left: boolean) => ref.current?.scrollBy({ left: left ? -360 : 360, behavior: "smooth" });
  return (
    <section className="editorial-carousel" aria-label={`${appTitle} screenshots`}>
      <div ref={ref} className="editorial-carousel-track">
        {screenshots.map((shot) => <div key={shot.id} className="editorial-carousel-shot" style={{ aspectRatio: `${shot.width}/${shot.height}` }}><Image src={shot.src} alt={shot.alt} fill sizes="(max-width: 768px) 70vw, 320px" className="object-cover" /></div>)}
      </div>
      {screenshots.length > 1 && <div className="editorial-carousel-controls"><button type="button" onClick={() => scroll(true)} aria-label="Previous screenshots"><ChevronLeft size={18} /></button><button type="button" onClick={() => scroll(false)} aria-label="Next screenshots"><ChevronRight size={18} /></button></div>}
    </section>
  );
}
