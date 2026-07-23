export type AppType = "mobile" | "desktop" | "web" | "backend";
export type WorkType = "personal" | "work";

export type ProjectSectionEntry = {
  title?: string;
  paragraphs: string[];
  bullets: string[];
  codeBlocks: {
    language: string;
    content: string;
  }[];
};

export type ProjectSection = {
  title: string;
  entries: ProjectSectionEntry[];
};

export type AppScreenshot = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  order: number;
};

export type AppItem = {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  featured: boolean;
  appType: AppType;
  workType: WorkType;
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
  sections: ProjectSection[];
  screenshots: AppScreenshot[];
};

export type CertificateImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type CertificateItem = {
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
  image?: CertificateImage;
};

export type WorkExperienceItem = {
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
};

export type PortfolioLink = {
  label: string;
  href: string;
  kind: "primary" | "secondary";
  note: string;
};

export type HeroLink = {
  id: string;
  label: string;
  href: string;
  kind: string;
  note: string;
  order: number;
};

export type DirectoryLink = {
  id: string;
  title: string;
  value: string;
  href: string;
  caption: string;
  order: number;
};

export type SkillCategory = {
  id: string;
  name: string;
  items: string[];
};

export type Profile = {
  id: string;
  name: string;
  role: string;
  intro: string;
  location: string;
  openToOpportunities: boolean;
  photoSrc: string;
  photoAlt: string;
  photoWidth: number;
  photoHeight: number;
};

export type Contact = {
  id: string;
  email: string;
  whatsapp: string;
  github: string;
  linkedin: string;
  playStore: string;
  playConsole: string;
  cv: string;
};

export type SiteSettings = {
  id: string;
  accentPreset: string;
  accentColor: string;
  heroGameId: string;
  colorScheme: string;
  logoSrc: string;
};
