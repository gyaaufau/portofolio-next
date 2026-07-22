import type { ReactNode } from "react";
import { PixelOrnament, type PixelOrnamentName } from "./pixel-ornament";

interface PublicPageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  ornament?: PixelOrnamentName;
  action?: ReactNode;
  className?: string;
}

export function PublicPageHeader({
  eyebrow,
  title,
  description,
  ornament,
  action,
  className = "",
}: PublicPageHeaderProps) {
  return (
    <header className={`grid gap-8 py-14 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:py-20 ${className}`}>
      <div className="max-w-3xl">
        <div className="flex items-center gap-3">
          {ornament && <PixelOrnament name={ornament} className="size-12 shrink-0" />}
          <p className="text-pixel text-[9px] text-primary">{eyebrow}</p>
        </div>
        <h1 className="mt-5 text-[clamp(3.4rem,8vw,7rem)] font-semibold leading-[0.9] tracking-[-0.065em]">{title}</h1>
        {description && <p className="mt-6 max-w-[58ch] text-lg leading-8 text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="justify-self-start md:justify-self-end">{action}</div>}
    </header>
  );
}
