import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppCard } from "@/components/app-card";
import { SectionShell } from "@/components/section-shell";
import { SectionLeadingIcon } from "@/components/section-leading-icon";
import { getFeaturedApps } from "@/data/db";

export async function AppsSection() {
  const apps = await getFeaturedApps();
  return (
    <SectionShell
      id="apps"
      title="Apps worth opening."
      description="Production work and personal products, presented with the decisions and craft behind them."
      headingAdornment={<SectionLeadingIcon name="app-catalog" />}
    >
      <div className="border-t border-border">{apps.map((app) => <AppCard key={app.id} app={app} />)}</div>
      <Link href="/apps" className="pixel-button mt-7 bg-card text-foreground">Browse all apps <ArrowRight className="size-4" /></Link>
    </SectionShell>
  );
}
