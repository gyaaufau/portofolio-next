import Link from "next/link";
import { StoreBadge } from "./store-badge";
import type { AppItem } from "@/data/types";

type AppCardProps = {
  app: AppItem;
};

export function AppCard({ app }: AppCardProps) {
  return (
    <Link
      href={`/apps/${app.slug}`}
      className="group flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all duration-200 hover:shadow-sm active:scale-[0.99]"
    >
      <img
        src={app.appIconSrc}
        alt={app.appIconAlt}
        width={64}
        height={64}
        className="rounded-xl size-16 shrink-0 object-cover border border-border"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {app.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {app.tagline}
            </p>
          </div>
          {app.featured && (
            <span className="badge-pixel text-primary shrink-0">Featured</span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <StoreBadge type={app.appType} variant="app" />
          <StoreBadge type={app.workType} variant="work" />
        </div>
      </div>
    </Link>
  );
}
