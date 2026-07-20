import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { AppItem } from "@/data/types";

export function AppCard({ app }: { app: AppItem }) {
  const preview = app.screenshots[0];
  return (
    <Link href={`/apps/${app.slug}`} className="group grid overflow-hidden border-b border-border py-6 transition-colors hover:bg-primary/[0.035] md:grid-cols-[8rem_1fr_14rem] md:gap-6 md:px-4">
      <div className="flex items-start gap-4">
        <Image src={app.appIconSrc} alt={app.appIconAlt} width={88} height={88} className="size-20 rounded-[6px] border border-border object-cover [image-rendering:auto] md:size-24" />
      </div>
      <div className="mt-4 min-w-0 md:mt-0">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold tracking-[-0.025em] group-hover:text-primary md:text-2xl">{app.title}</h3>
          {app.featured && <span className="badge-pixel text-primary">Featured</span>}
        </div>
        <p className="mt-2 max-w-[58ch] leading-6 text-muted-foreground">{app.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
          <span>{app.appType}</span><span>{app.workType}</span><span>{app.periodShort}</span>
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between gap-4 md:mt-0 md:justify-end">
        {preview ? (
          <div className="relative hidden h-28 w-24 overflow-hidden rounded-[4px] border border-border bg-secondary md:block">
            <Image src={preview.src} alt={preview.alt} fill sizes="96px" className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]" />
          </div>
        ) : null}
        <ArrowUpRight className="size-5 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
      </div>
    </Link>
  );
}
