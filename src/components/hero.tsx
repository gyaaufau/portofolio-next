import Image from "next/image";
import Link from "next/link";
import type { PortfolioLink } from "@/data/portfolio";

interface HeroProps {
  name: string;
  role: string;
  intro: string;
  location: string;
  openToOpportunities?: boolean;
  links: PortfolioLink[];
  photo: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
}

const isExternalLink = (href: string) => href.startsWith("http://") || href.startsWith("https://");

export function Hero({ name, role, intro, location, openToOpportunities = true, links, photo }: HeroProps) {
  return (
    <header className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
      <div className="col-span-1 md:col-span-1 relative rounded-3xl p-8 bg-card border border-border shadow-sm flex flex-col justify-center overflow-hidden">
        {openToOpportunities && (
          <div className="mb-3 hero-animate-status">
            <span className="inline-flex items-center gap-1.5 border border-primary/20 rounded-full px-3 py-1 text-xs font-semibold text-primary bg-primary/10">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Open to Opportunities
            </span>
          </div>
        )}
        <p className="mb-[0.9rem] text-[clamp(1rem,1.8vw,1.2rem)] tracking-[0.02em] font-medium text-muted-foreground hero-animate-kicker">
          Hello, I am
        </p>
        <h1 className="m-0 max-w-[14ch] text-[clamp(2.8rem,6vw,4.8rem)] leading-[1.05] tracking-[-0.03em] font-bold hero-animate-name">
          {name}
        </h1>
        <p className="mt-[0.85rem] text-primary text-[clamp(0.95rem,2vw,1.1rem)] font-medium hero-animate-role">
          {role}
        </p>
        <p className="max-w-[58ch] mt-4 text-muted-foreground text-[1.05rem] leading-[1.7] hero-animate-intro">
          {intro}
        </p>
        <div className="flex flex-wrap gap-[0.55rem] mt-[1.1rem] hero-animate-meta">
          <span className="inline-flex items-center gap-[0.42rem] border border-muted rounded-full px-3 py-[0.4rem] text-muted-foreground bg-secondary text-[0.78rem] font-medium">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="w-[0.92rem] h-[0.92rem] flex-shrink-0">
              <path
                d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Zm0-8.25A2.75 2.75 0 1 0 12 7.25a2.75 2.75 0 0 0 0 5.5Z"
                fill="currentColor"
              />
            </svg>
            {location}
          </span>
        </div>
        <div className="flex flex-wrap gap-3 mt-6 hero-animate-actions">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              target={isExternalLink(link.href) ? "_blank" : undefined}
              rel={isExternalLink(link.href) ? "noreferrer" : undefined}
              title={link.note}
              className={`inline-flex items-center justify-center min-h-[2.75rem] rounded-full px-5 py-[0.72rem] border text-[0.85rem] font-semibold transition-all hover:-translate-y-0.5 ${link.kind === "primary"
                  ? "bg-primary text-primary-foreground border-transparent hover:bg-primary/90"
                  : "bg-secondary border-border text-foreground hover:border-muted hover:bg-card"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="col-span-1 md:col-span-1 relative rounded-3xl overflow-hidden bg-card border border-border shadow-sm hero-animate-visual">
        <div className="relative min-h-[420px] bg-transparent">
          {photo.src ? (
            <Image
              className="w-full min-h-[420px] object-cover"
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              priority
            />
          ) : (
            <div className="grid place-items-center gap-[0.55rem] min-h-[420px] border border-dashed border-muted bg-secondary text-muted-foreground text-center text-[0.85rem] font-medium" aria-label={photo.alt}>
              <span>photo</span>
              <span>add image in `public/data/myself`</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
