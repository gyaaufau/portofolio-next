import { Smartphone, Monitor, Globe, Server, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppType, WorkType } from "@/data/types";

const appTypeConfig: Record<AppType, { icon: React.ElementType; label: string }> = {
  mobile: { icon: Smartphone, label: "Mobile" },
  desktop: { icon: Monitor, label: "Desktop" },
  web: { icon: Globe, label: "Web" },
  backend: { icon: Server, label: "Backend" },
};

const workTypeConfig: Record<WorkType, { icon: React.ElementType; label: string }> = {
  personal: { icon: User, label: "Personal" },
  work: { icon: Briefcase, label: "Work" },
};

type StoreBadgeProps = {
  type: AppType | WorkType;
  variant?: "app" | "work";
  className?: string;
};

export function StoreBadge({ type, variant = "app", className }: StoreBadgeProps) {
  const config = variant === "app" ? appTypeConfig[type as AppType] : workTypeConfig[type as WorkType];
  if (!config) return null;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "badge-pixel inline-flex items-center gap-1.5 text-muted-foreground",
        className
      )}
    >
      <Icon className="size-3" strokeWidth={2} />
      {config.label}
    </span>
  );
}
