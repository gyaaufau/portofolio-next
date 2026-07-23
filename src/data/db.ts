import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type {
  AppItem,
  CertificateItem,
  WorkExperienceItem,
  HeroLink,
  DirectoryLink,
  Profile,
  Contact,
  SkillCategory,
  PortfolioLink,
  AppType,
  WorkType,
  ProjectSection,
  SiteSettings,
} from "./types";
import { DEFAULT_ACCENT } from "@/lib/theme";

function normalizeAppType(value: string): AppType {
  const v = value.toLowerCase();
  if (v === "desktop") return "desktop";
  if (v === "web") return "web";
  if (v === "backend") return "backend";
  return "mobile";
}

function normalizeWorkType(value: string): WorkType {
  return value.toLowerCase() === "work" ? "work" : "personal";
}

function mapApp(row: Record<string, unknown>): AppItem {
  const screenshots = (row.app_screenshot as Record<string, unknown>[] ?? []).map((s) => ({
    id: s.id as string,
    src: s.src as string,
    alt: s.alt as string,
    width: s.width as number,
    height: s.height as number,
    order: s.order as number,
  }));

  return {
    id: row.id as string,
    title: row.title as string,
    slug: row.slug as string,
    tagline: row.tagline as string,
    description: row.description as string,
    featured: row.featured as boolean,
    appType: normalizeAppType(row.app_type as string),
    workType: normalizeWorkType(row.work_type as string),
    period: row.period as string,
    periodShort: row.period_short as string,
    appStoreUrl: row.app_store_url as string | null,
    playStoreUrl: row.play_store_url as string | null,
    websiteUrl: row.website_url as string | null,
    githubUrl: row.github_url as string | null,
    otherUrl: row.other_url as string | null,
    otherUrlLabel: row.other_url_label as string | null,
    appIconSrc: row.app_icon_src as string,
    appIconAlt: row.app_icon_alt as string,
    thumbnailSrc: row.thumbnail_src as string,
    thumbnailAlt: row.thumbnail_alt as string,
    stack: row.stack as string[],
    highlights: row.highlights as string[],
    sections: (row.sections as ProjectSection[]) ?? [],
    screenshots,
  };
}

function mapCertificate(row: Record<string, unknown>): CertificateItem {
  return {
    id: row.id as string,
    title: row.title as string,
    featured: row.featured as boolean,
    issuer: row.issuer as string,
    issued: row.issued as string,
    type: row.type as string,
    summary: row.summary as string,
    details: row.details as string[],
    relevance: row.relevance as string,
    issuerNotes: row.issuer_notes as string[],
    image:
      row.image_src && row.image_alt && row.image_width && row.image_height
        ? {
            src: row.image_src as string,
            alt: row.image_alt as string,
            width: row.image_width as number,
            height: row.image_height as number,
          }
        : undefined,
  };
}

function mapWorkExperience(row: Record<string, unknown>): WorkExperienceItem {
  return {
    id: row.id as string,
    company: row.company as string,
    location: row.location as string,
    role: row.role as string,
    start: row.start as string,
    end: row.end as string,
    period: row.period as string,
    sortOrder: row.sort_order as number,
    summary: row.summary as string,
    highlights: row.highlights as string[],
  };
}

async function getSupabase() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export const getProfile = cache(async function getProfile(): Promise<Profile> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("profile").select("*").limit(1).single();
  if (error || !data) throw new Error("Profile not found");
  return data as Profile;
});

export const getContact = cache(async function getContact(): Promise<Contact> {
  const supabase = await getSupabase();
  const { data, error } = await supabase.from("contact").select("*").limit(1).single();
  if (error || !data) throw new Error("Contact not found");
  return data as Contact;
});

export const getHeroLinks = cache(async function getHeroLinks(): Promise<HeroLink[]> {
  const supabase = await getSupabase();
  const { data } = await supabase.from("hero_link").select("*").order("order");
  return (data ?? []) as HeroLink[];
});

export const getDirectoryLinks = cache(async function getDirectoryLinks(): Promise<DirectoryLink[]> {
  const supabase = await getSupabase();
  const { data } = await supabase.from("directory_link").select("*").order("order");
  return (data ?? []) as DirectoryLink[];
});

export const getSkillCategories = cache(async function getSkillCategories(): Promise<SkillCategory[]> {
  const supabase = await getSupabase();
  const { data } = await supabase.from("skill_category").select("*");
  return (data ?? []) as SkillCategory[];
});

export const getApps = cache(async function getApps(): Promise<AppItem[]> {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("app")
    .select("*, app_screenshot(*)")
    .order("sort_order", { ascending: false });
  return (data ?? []).map(mapApp);
});

export const getFeaturedApps = cache(async function getFeaturedApps(): Promise<AppItem[]> {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("app")
    .select("*, app_screenshot(*)")
    .eq("featured", true)
    .order("sort_order", { ascending: false })
    .limit(3);
  return (data ?? []).map(mapApp);
});

export const getAppBySlug = cache(async function getAppBySlug(slug: string): Promise<AppItem | null> {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("app")
    .select("*, app_screenshot(*)")
    .eq("slug", slug)
    .single();
  return data ? mapApp(data) : null;
});

export const getCertificates = cache(async function getCertificates(): Promise<CertificateItem[]> {
  const supabase = await getSupabase();
  const { data } = await supabase
    .from("certificate")
    .select("*")
    .order("issued", { ascending: false });
  return (data ?? []).map(mapCertificate);
});

export const getFeaturedCertificates = cache(async function getFeaturedCertificates(): Promise<CertificateItem[]> {
  const supabase = await getSupabase();
  const { data: featured } = await supabase
    .from("certificate")
    .select("*")
    .eq("featured", true)
    .order("issued", { ascending: false })
    .limit(3);
  if (featured && featured.length >= 3) return featured.map(mapCertificate);
  const { data: fallback } = await supabase
    .from("certificate")
    .select("*")
    .order("issued", { ascending: false })
    .limit(3);
  return (fallback ?? []).map(mapCertificate);
});

export const getCertificateBySlug = cache(async function getCertificateBySlug(
  id: string
): Promise<CertificateItem | null> {
  const supabase = await getSupabase();
  const { data } = await supabase.from("certificate").select("*").eq("id", id).single();
  return data ? mapCertificate(data) : null;
});

export const getWorkExperiences = cache(async function getWorkExperiences(): Promise<WorkExperienceItem[]> {
  const supabase = await getSupabase();
  const { data } = await supabase.from("work_experience").select("*").order("sort_order");
  return (data ?? []).map(mapWorkExperience);
});

export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await getSupabase();
    const { data } = await supabase.from("site_settings").select("*").eq("id", "site").single();
    return data ?? { id: "site", accentPreset: "moss", accentColor: DEFAULT_ACCENT };
  } catch {
    return { id: "site", accentPreset: "moss", accentColor: DEFAULT_ACCENT };
  }
});

export async function getPortfolio() {
  const [profile, contact, heroLinks, skills, apps, certificates, experiences] =
    await Promise.all([
      getProfile(),
      getContact(),
      getHeroLinks(),
      getSkillCategories(),
      getFeaturedApps(),
      getFeaturedCertificates(),
      getWorkExperiences(),
    ]);

  const skillItems = skills.find((s) => s.name === "skills")?.items ?? [];
  const techItems = skills.find((s) => s.name === "tech")?.items ?? [];
  const softItems = skills.find((s) => s.name === "softSkills")?.items ?? [];

  return {
    name: profile.name,
    role: profile.role,
    location: profile.location,
    intro: profile.intro,
    about: [profile.intro],
    openToOpportunities: profile.openToOpportunities,
    skills: skillItems,
    tech: techItems,
    softSkills: softItems,
    photo: {
      src: profile.photoSrc,
      alt: profile.photoAlt,
      width: profile.photoWidth,
      height: profile.photoHeight,
    },
    heroLinks: heroLinks.map(
      (l): PortfolioLink => ({
        label: l.label,
        href: l.href,
        kind: l.kind as "primary" | "secondary",
        note: l.note,
      })
    ),
    contact,
    projects: apps,
    certificates,
    workExperiences: experiences,
  };
}
