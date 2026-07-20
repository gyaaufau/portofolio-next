import { prisma } from "@/lib/prisma";
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

function mapApp(row: {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  featured: boolean;
  appType: string;
  workType: string;
  period: string;
  periodShort: string;
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  websiteUrl: string | null;
  githubUrl: string | null;
  otherUrl: string | null;
  otherUrlLabel: string | null;
  appIconSrc: string;
  appIconAlt: string;
  thumbnailSrc: string;
  thumbnailAlt: string;
  stack: string[];
  highlights: string[];
  sections: unknown;
  screenshots: {
    id: string;
    src: string;
    alt: string;
    width: number;
    height: number;
    order: number;
  }[];
}): AppItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    tagline: row.tagline,
    description: row.description,
    featured: row.featured,
    appType: normalizeAppType(row.appType),
    workType: normalizeWorkType(row.workType),
    period: row.period,
    periodShort: row.periodShort,
    appStoreUrl: row.appStoreUrl,
    playStoreUrl: row.playStoreUrl,
    websiteUrl: row.websiteUrl,
    githubUrl: row.githubUrl,
    otherUrl: row.otherUrl,
    otherUrlLabel: row.otherUrlLabel,
    appIconSrc: row.appIconSrc,
    appIconAlt: row.appIconAlt,
    thumbnailSrc: row.thumbnailSrc,
    thumbnailAlt: row.thumbnailAlt,
    stack: row.stack,
    highlights: row.highlights,
    sections: (row.sections as ProjectSection[]) ?? [],
    screenshots: row.screenshots.map((s) => ({
      id: s.id,
      src: s.src,
      alt: s.alt,
      width: s.width,
      height: s.height,
      order: s.order,
    })),
  };
}

function mapCertificate(row: {
  id: string;
  title: string;
  featured: boolean;
  issuer: string;
  issued: string;
  type: string;
  summary: string;
  details: string[];
  relevance: string;
  issuerNotes: string[];
  imageSrc: string | null;
  imageAlt: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
}): CertificateItem {
  return {
    id: row.id,
    title: row.title,
    featured: row.featured,
    issuer: row.issuer,
    issued: row.issued,
    type: row.type,
    summary: row.summary,
    details: row.details,
    relevance: row.relevance,
    issuerNotes: row.issuerNotes,
    image:
      row.imageSrc && row.imageAlt && row.imageWidth && row.imageHeight
        ? {
            src: row.imageSrc,
            alt: row.imageAlt,
            width: row.imageWidth,
            height: row.imageHeight,
          }
        : undefined,
  };
}

function mapWorkExperience(row: {
  id: string;
  company: string;
  location: string;
  role: string;
  start: string;
  end: string;
  period: string;
  sortOrder: number;
  summary: string;
  highlights: string[];
}): WorkExperienceItem {
  return {
    id: row.id,
    company: row.company,
    location: row.location,
    role: row.role,
    start: row.start,
    end: row.end,
    period: row.period,
    sortOrder: row.sortOrder,
    summary: row.summary,
    highlights: row.highlights,
  };
}

export async function getProfile(): Promise<Profile> {
  const row = await prisma.profile.findFirst();
  if (!row) throw new Error("Profile not found");
  return row;
}

export async function getContact(): Promise<Contact> {
  const row = await prisma.contact.findFirst();
  if (!row) throw new Error("Contact not found");
  return row;
}

export async function getHeroLinks(): Promise<HeroLink[]> {
  return prisma.heroLink.findMany({ orderBy: { order: "asc" } });
}

export async function getDirectoryLinks(): Promise<DirectoryLink[]> {
  return prisma.directoryLink.findMany({ orderBy: { order: "asc" } });
}

export async function getSkillCategories(): Promise<SkillCategory[]> {
  return prisma.skillCategory.findMany();
}

export async function getApps(): Promise<AppItem[]> {
  const rows = await prisma.app.findMany({
    include: { screenshots: { orderBy: { order: "asc" } } },
    orderBy: { sortOrder: "desc" },
  });
  return rows.map(mapApp);
}

export async function getFeaturedApps(): Promise<AppItem[]> {
  const rows = await prisma.app.findMany({
    where: { featured: true },
    include: { screenshots: { orderBy: { order: "asc" } } },
    orderBy: { sortOrder: "desc" },
    take: 3,
  });
  return rows.map(mapApp);
}

export async function getAppBySlug(slug: string): Promise<AppItem | null> {
  const row = await prisma.app.findUnique({
    where: { slug },
    include: { screenshots: { orderBy: { order: "asc" } } },
  });
  return row ? mapApp(row) : null;
}

export async function getCertificates(): Promise<CertificateItem[]> {
  const rows = await prisma.certificate.findMany({
    orderBy: { issued: "desc" },
  });
  return rows.map(mapCertificate);
}

export async function getFeaturedCertificates(): Promise<CertificateItem[]> {
  const rows = await prisma.certificate.findMany({
    where: { featured: true },
    orderBy: { issued: "desc" },
    take: 3,
  });
  if (rows.length < 3) {
    const fallback = await prisma.certificate.findMany({
      orderBy: { issued: "desc" },
      take: 3,
    });
    return fallback.map(mapCertificate);
  }
  return rows.map(mapCertificate);
}

export async function getCertificateBySlug(
  id: string
): Promise<CertificateItem | null> {
  const row = await prisma.certificate.findUnique({ where: { id } });
  return row ? mapCertificate(row) : null;
}

export async function getWorkExperiences(): Promise<WorkExperienceItem[]> {
  const rows = await prisma.workExperience.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return rows.map(mapWorkExperience);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } });
    return settings ?? { id: "site", accentPreset: "moss", accentColor: DEFAULT_ACCENT };
  } catch {
    return { id: "site", accentPreset: "moss", accentColor: DEFAULT_ACCENT };
  }
}

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
