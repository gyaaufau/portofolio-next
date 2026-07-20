"use client";

import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AppScreenshot } from "@/data/types";

export function ScreenshotCarousel({ screenshots, appTitle }: { screenshots: AppScreenshot[]; appTitle: string }) {
  const ref = useRef<HTMLDivElement>(null);
  if (!screenshots.length) return <div className="pixel-frame bg-card p-8 text-muted-foreground">Screenshots for {appTitle} are coming soon.</div>;
  const scroll = (left: boolean) => ref.current?.scrollBy({ left: left ? -360 : 360, behavior: "smooth" });
  return (
    <section className="pixel-frame relative overflow-hidden bg-card p-3 md:p-5" aria-label={`${appTitle} screenshots`}>
      <div ref={ref} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
        {screenshots.map((shot) => <div key={shot.id} className="relative h-[29rem] w-auto shrink-0 snap-center overflow-hidden rounded-[4px] border border-border bg-secondary" style={{ aspectRatio: `${shot.width}/${shot.height}` }}><Image src={shot.src} alt={shot.alt} fill sizes="(max-width: 768px) 70vw, 320px" className="object-cover" /></div>)}
      </div>
      {screenshots.length > 1 && <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => scroll(true)} className="pixel-button min-h-0 bg-background p-2.5" aria-label="Previous screenshots"><ChevronLeft className="size-4" /></button><button type="button" onClick={() => scroll(false)} className="pixel-button min-h-0 bg-background p-2.5" aria-label="Next screenshots"><ChevronRight className="size-4" /></button></div>}
    </section>
  );
}
