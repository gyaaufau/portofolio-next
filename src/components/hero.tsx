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
    <header className="hero">
      <div className="hero-copy panel">
        {openToOpportunities && (
          <div className="hero-status-row hero-animate-status">
            <span className="hero-opportunity-pill">Open to Opportunities</span>
          </div>
        )}
        <p className="hero-kicker hero-animate-kicker">Hello, I am</p>
        <h1 className="hero-animate-name">{name}</h1>
        <p className="hero-role hero-animate-role">{role}</p>
        <p className="hero-intro hero-animate-intro">{intro}</p>
        <div className="hero-meta hero-animate-meta">
          <span className="hero-location-pill">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 21s-6-4.35-6-10a6 6 0 1 1 12 0c0 5.65-6 10-6 10Zm0-8.25A2.75 2.75 0 1 0 12 7.25a2.75 2.75 0 0 0 0 5.5Z"
                fill="currentColor"
              />
            </svg>
            {location}
          </span>
        </div>
        <div className="hero-actions hero-animate-actions">
          {links.map((link) => (
            <Link
              key={link.href}
              className={`button-link ${link.kind === "primary" ? "primary" : "secondary"}`}
              href={link.href}
              target={isExternalLink(link.href) ? "_blank" : undefined}
              rel={isExternalLink(link.href) ? "noreferrer" : undefined}
              title={link.note}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="hero-visual panel hero-animate-visual">
        <div className="portrait-shell">
          {photo.src ? (
            <Image
              className="portrait-image"
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              priority
            />
          ) : (
            <div className="portrait-fallback" aria-label={photo.alt}>
              <span>photo</span>
              <span>add image in `public/data/myself`</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
