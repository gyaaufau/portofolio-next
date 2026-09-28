"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { AppItem } from "@/data/types";

export function EditorialAppCatalog({ apps }: { apps: AppItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [platform, setPlatform] = useState("all");
  const [year, setYear] = useState("all");
  const categories = [...new Set(apps.map((app) => app.category).filter(Boolean))];
  const years = [...new Set(apps.map((app) => app.releaseYear).filter((value): value is number => value !== null))].sort((a, b) => b - a);
  const filtered = useMemo(() => apps.filter((app) => {
    const haystack = `${app.title} ${app.tagline} ${app.category} ${app.stack.join(" ")}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (category === "all" || app.category === category) && (platform === "all" || app.appType === platform) && (year === "all" || app.releaseYear === Number(year));
  }), [apps, category, platform, query, year]);
  return <><div className="editorial-filters"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, category, or platform" aria-label="Search apps" /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option value="all">Category: all</option>{categories.map((value) => <option value={value} key={value}>{value}</option>)}</select><select value={platform} onChange={(event) => setPlatform(event.target.value)} aria-label="Filter by platform"><option value="all">Platform: all</option>{["mobile", "web", "desktop", "backend"].map((value) => <option value={value} key={value}>{value}</option>)}</select><select value={year} onChange={(event) => setYear(event.target.value)} aria-label="Filter by release year"><option value="all">Year: all</option>{years.map((value) => <option value={value} key={value}>{value}</option>)}</select></div><p className="editorial-result-count">Showing {filtered.length} of {apps.length} apps</p>{filtered.length ? <div className="editorial-catalog-grid">{filtered.map((app) => <Link href={`/apps/${app.slug}`} key={app.id}><div>{<Image src={app.thumbnailSrc} alt={app.thumbnailAlt} fill sizes="(min-width: 1100px) 25vw, (min-width: 700px) 50vw, 100vw" className="object-cover object-top" />}</div><small>{[app.appType, app.category || app.workType].filter(Boolean).join(" · ")}</small><h2>{app.title}</h2><p>{app.tagline}</p></Link>)}</div> : <p className="editorial-empty">No published apps match those filters.</p>}</>;
}
