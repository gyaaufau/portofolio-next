import Link from "next/link";
import Image from "next/image";
import { ArrowDownRight, FileText, MapPin } from "lucide-react";

interface HeroProps {
  name: string;
  role: string;
  intro: string;
  location: string;
  openToOpportunities?: boolean;
}

export function Hero({ name, role, intro, location, openToOpportunities = true }: HeroProps) {
  const readableIntro = intro.replace(/\s*[—–]\s*/g, ", ");

  return (
    <header id="top" className="immersive-hero">
      <div className="hero-city" aria-hidden="true">
        <picture className="hero-city-layer hero-city-layer-light">
          <source media="(max-width: 767px)" srcSet="/assets/hero/hero_none_apocalypse_pixel_background_mobile.png" />
          <img src="/assets/hero/hero_none_apocalypse_pixel_background.png" alt="" className="hero-city-image" fetchPriority="high" />
        </picture>
        <picture className="hero-city-layer hero-city-layer-dark">
          <source media="(max-width: 767px)" srcSet="/assets/hero/hero_none_apocalypse_pixel_background_mobile_dark.png" />
          <img src="/assets/hero/hero_none_apocalypse_pixel_background_dark.png" alt="" className="hero-city-image" />
        </picture>
        <div className="hero-city-celestial">
          <Image src="/assets/hero/hero_none_pixel_sun.png" alt="" width={256} height={256} className="hero-city-sun" draggable={false} unoptimized />
          <Image src="/assets/hero/hero_none_pixel_moon.png" alt="" width={256} height={256} className="hero-city-moon" draggable={false} unoptimized />
        </div>
      </div>
      <div className="immersive-hero-copy hero-enter">
        <div className="max-w-xl">
          <div className="mb-7 flex items-center gap-3">
            <span className="text-pixel text-[9px] text-[color:var(--hero-accent)]">PORTFOLIO</span>
            {openToOpportunities && <span className="border-l border-white/20 pl-3 text-xs font-medium text-white/68">Available for new work</span>}
          </div>
          <h1 className="max-w-[10ch] text-[clamp(3.35rem,7vw,6.8rem)] font-semibold leading-[0.9] tracking-[-0.065em] text-[#f4f1e8]">
            {name}
          </h1>
          <p className="mt-6 text-lg font-semibold text-[color:var(--hero-accent)] md:text-xl">{role}</p>
          <p className="mt-4 max-w-[48ch] text-base leading-7 text-white/68 md:text-lg">{readableIntro}</p>
          <div className="mt-5 flex items-center gap-2 text-sm text-white/58">
            <MapPin className="size-4 text-[color:var(--hero-accent)]" aria-hidden="true" /> {location}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apps" className="pixel-button site-cta">
              View apps <ArrowDownRight className="size-4" />
            </Link>
            <Link href="/cv" className="pixel-button border-white/28 bg-black/26 text-[#f4f1e8] backdrop-blur-sm">
              Open CV <FileText className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
