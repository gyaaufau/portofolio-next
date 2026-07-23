import Link from "next/link";
import { ArrowDownRight, FileText, MapPin } from "lucide-react";
import { HeroGameShell } from "@/games/core/hero-game-shell";

interface HeroProps {
  name: string;
  role: string;
  intro: string;
  location: string;
  openToOpportunities?: boolean;
  gameId?: string;
}

export function Hero({ name, role, intro, location, openToOpportunities = true, gameId }: HeroProps) {
  const readableIntro = intro.replace(/\s*[—–]\s*/g, ", ");

  return (
    <header id="top" className="immersive-hero">
      <HeroGameShell gameId={gameId} />
      <div className="immersive-hero-copy hero-enter">
        <div className="max-w-xl">
          <div className="mb-7 flex items-center gap-3">
            <span className="text-pixel text-[9px] text-[color:var(--hero-accent)]">PLAYER ONE</span>
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
            <Link href="/apps" className="pixel-button border-transparent bg-[color:var(--hero-accent)] text-[#07110e]">
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
