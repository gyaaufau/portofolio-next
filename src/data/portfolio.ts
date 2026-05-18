import fs from "fs";
import path from "path";

export type PortfolioLink = {
  label: string;
  href: string;
  kind: "primary" | "secondary";
  note: string;
};

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

export type ProjectScreenshot = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type ProjectLogo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
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
  company: string;
  location: string;
  role: string;
  start: string;
  end: string;
  period: string;
  order: number;
  summary: string;
  highlights: string[];
};

export type ProjectType = "personal" | "work";
export type ProjectAppType = "mobile" | "web" | "rest-api";

export type ProjectItem = {
  id: string;
  title: string;
  summary: string;
  featured: boolean;
  projectType: ProjectType;
  appType: ProjectAppType;
  period: string;
  periodShort: string;
  stack: string[];
  highlight: string;
  details: string[];
  links: {
    label: string;
    href: string;
  }[];
  logo?: ProjectLogo;
  sections: ProjectSection[];
  screenshots: ProjectScreenshot[];
};

const dataDir = path.join(process.cwd(), "public", "data");

const readFile = (filePath: string) => {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
};

const readDir = (dirPath: string) => {
  try {
    return fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
};

const getImageDimensions = (filePath: string): { width: number; height: number } => {
  try {
    const buffer = fs.readFileSync(filePath);
    if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    } else if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let i = 2;
      while (i < buffer.length) {
        if (buffer[i] === 0xff) {
          const marker = buffer[i + 1];
          if (marker === 0xc0 || marker === 0xc2) {
            const height = buffer.readUInt16BE(i + 5);
            const width = buffer.readUInt16BE(i + 7);
            return { width, height };
          }
          const length = buffer.readUInt16BE(i + 2);
          i += length + 2;
        } else {
          i++;
        }
      }
    }
  } catch {
    // fallback
  }
  return { width: 800, height: 600 };
};

const humanizeSlug = (value: string) =>
  value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const parseProjectFolder = (folderName: string) => {
  const match = folderName.match(/^(\d+)[_-](.+)$/);
  const rawName = match?.[2] ?? folderName;
  const slug = rawName
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return {
    folderName,
    sortOrder: match ? Number(match[1]) : Number.MAX_SAFE_INTEGER,
    slug
  };
};

const normalizeProjectType = (value: unknown): ProjectType =>
  String(value).toLowerCase() === "work" ? "work" : "personal";

const normalizeProjectAppType = (value: unknown): ProjectAppType => {
  const normalized = String(value).toLowerCase();
  if (normalized === "web") {
    return "web";
  }
  if (normalized === "rest-api" || normalized === "rest_api" || normalized === "api") {
    return "rest-api";
  }
  return "mobile";
};

const cleanInline = (value: string) =>
  value
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .trim();

const parseFrontmatter = (markdown: string) => {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) {
    return { metadata: {}, body: markdown };
  }

  const metadata = Object.fromEntries(
    match[1]
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separatorIndex = line.indexOf(":");
        if (separatorIndex === -1) {
          return [line, ""];
        }

        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        const value =
          rawValue === "true" ? true : rawValue === "false" ? false : rawValue.replace(/^["']|["']$/g, "");
        return [key, value];
      })
  );

  return {
    metadata,
    body: markdown.slice(match[0].length)
  };
};

const splitParagraphs = (lines: string[]) => {
  const paragraphs: string[] = [];
  let buffer: string[] = [];

  for (const rawLine of lines) {
    const line = cleanInline(rawLine);

    if (!line) {
      if (buffer.length > 0) {
        paragraphs.push(buffer.join(" "));
        buffer = [];
      }
      continue;
    }

    buffer.push(line);
  }

  if (buffer.length > 0) {
    paragraphs.push(buffer.join(" "));
  }

  return paragraphs;
};

const extractSectionParagraphs = (markdown: string, title: string) => {
  const lines = markdown.split("\n");
  const sectionTitle = `## ${title}`.toLowerCase();
  const collected: string[] = [];
  let inSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^##\s+/.test(line)) {
      if (line.toLowerCase() === sectionTitle) {
        inSection = true;
        continue;
      }

      if (inSection) {
        break;
      }
    }

    if (!inSection || !line || /^-\s+/.test(line)) {
      continue;
    }

    collected.push(cleanInline(line));
  }

  return splitParagraphs(collected);
};

const extractSectionBullets = (markdown: string, title: string) => {
  const lines = markdown.split("\n");
  const sectionTitle = `## ${title}`.toLowerCase();
  const collected: string[] = [];
  let inSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^##\s+/.test(line)) {
      if (line.toLowerCase() === sectionTitle) {
        inSection = true;
        continue;
      }

      if (inSection) {
        break;
      }
    }

    if (!inSection) {
      continue;
    }

    if (/^-\s+/.test(line)) {
      collected.push(cleanInline(line.replace(/^-\s+/, "")));
    }
  }

  return collected;
};

const extractAboutSectionBullets = (markdown: string, title: string) => {
  const lines = markdown.split("\n");
  const sectionTitle = `## ${title}`.toLowerCase();
  const collected: string[] = [];
  let inSection = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (/^##\s+/.test(line)) {
      if (line.toLowerCase() === sectionTitle) {
        inSection = true;
        continue;
      }

      if (inSection) {
        break;
      }
    }

    if (!inSection) {
      continue;
    }

    if (/^-\s+/.test(line)) {
      collected.push(cleanInline(line.replace(/^-\s+/, "")));
    }
  }

  return collected;
};

const extractAboutSummary = (markdown: string) => {
  const firstSectionIndex = markdown.search(/^##\s+/m);
  const summarySource = firstSectionIndex === -1 ? markdown : markdown.slice(0, firstSectionIndex);
  return splitParagraphs(summarySource.split("\n"));
};

const contactSource = readFile(path.join(dataDir, "myself", "contact.md")) ?? "";
const aboutSource = readFile(path.join(dataDir, "myself", "about.md")) ?? "";

const parsedContact = parseFrontmatter(contactSource);
const contactData = {
  location: String(parsedContact.metadata.location ?? "Bandung, Indonesia"),
  email: String(parsedContact.metadata.email ?? "hello@example.com"),
  whatsapp: String(parsedContact.metadata.whatsapp ?? "https://wa.me/"),
  github: String(parsedContact.metadata.github ?? "https://github.com/"),
  linkedin: String(parsedContact.metadata.linkedin ?? "https://linkedin.com/"),
  playStore: String(parsedContact.metadata.playStore ?? "https://play.google.com/store/"),
  playConsole: String(parsedContact.metadata.playConsole ?? "https://play.google.com/console/"),
  cv: String(parsedContact.metadata.cv ?? "/cv")
};

const parsedAbout = parseFrontmatter(aboutSource);
const aboutParagraphs = extractAboutSummary(parsedAbout.body);
const aboutSkills = extractAboutSectionBullets(parsedAbout.body, "Mobile Development");
const aboutTech = extractAboutSectionBullets(parsedAbout.body, "Tools & Integration");
const aboutSoftSkills = extractAboutSectionBullets(parsedAbout.body, "Soft Skills");
const aboutData = {
  name: String(parsedAbout.metadata.name ?? "Argya Aulia Fauzandika"),
  role: String(parsedAbout.metadata.role ?? "Mobile Developer (Flutter)"),
  intro: String(
    parsedAbout.metadata.intro ??
    "I build mobile products with a focus on thoughtful Flutter architecture, smooth UX, and maintainable code that can grow with the team."
  ),
  openToOpportunities: parsedAbout.metadata.openToOpportunities !== false,
  paragraphs: aboutParagraphs.length > 0 ? aboutParagraphs : ["Profile content will be added soon."],
  skills: aboutSkills,
  tech: aboutTech,
  softSkills: aboutSoftSkills
};

const parseSectionEntries = (body: string): ProjectSectionEntry[] => {
  const parts = body.split(/^###\s+/m);
  const titles = [...body.matchAll(/^###\s+(.+)$/gm)].map((match) => cleanInline(match[1]));

  const parseEntryBody = (chunk: string, title?: string): ProjectSectionEntry => {
    const lines = chunk.split("\n");
    const codeBlocks: { language: string; content: string }[] = [];
    const contentLines: string[] = [];
    let activeCodeBlock: { language: string; lines: string[] } | null = null;

    for (const line of lines) {
      const fenceMatch = line.match(/^```(\w+)?\s*$/);
      if (fenceMatch) {
        if (activeCodeBlock) {
          codeBlocks.push({
            language: activeCodeBlock.language,
            content: activeCodeBlock.lines.join("\n")
          });
          activeCodeBlock = null;
        } else {
          activeCodeBlock = {
            language: fenceMatch[1] ?? "",
            lines: []
          };
        }
        continue;
      }

      if (activeCodeBlock) {
        activeCodeBlock.lines.push(line);
        continue;
      }

      contentLines.push(line);
    }

    const bullets = lines
      .filter((line) => /^-\s+/.test(line.trim()) || /^\d+\.\s+/.test(line.trim()))
      .map((line) => cleanInline(line.replace(/^-\s+/, "").replace(/^\d+\.\s+/, "")));
    const paragraphLines = contentLines.filter((line) => {
      const trimmed = line.trim();
      return trimmed && !/^-\s+/.test(trimmed) && !/^\d+\.\s+/.test(trimmed);
    });

    return {
      title,
      paragraphs: splitParagraphs(paragraphLines),
      bullets,
      codeBlocks
    };
  };

  if (parts.length === 1) {
    return [parseEntryBody(parts[0])];
  }

  const intro = parts[0].trim();
  const entries: ProjectSectionEntry[] = [];

  if (intro) {
    entries.push(parseEntryBody(intro));
  }

  for (let index = 1; index < parts.length; index += 1) {
    entries.push(parseEntryBody(parts[index], titles[index - 1]));
  }

  return entries.filter(
    (entry) => entry.paragraphs.length > 0 || entry.bullets.length > 0 || entry.codeBlocks.length > 0 || entry.title
  );
};

const parseSections = (markdown: string): ProjectSection[] => {
  const matches = [...markdown.matchAll(/^##\s+(.+)$/gm)];

  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const bodyStart = start + match[0].length;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? markdown.length) : markdown.length;
    const body = markdown.slice(bodyStart, end).trim();

    return {
      title: cleanInline(match[1]),
      entries: parseSectionEntries(body)
    };
  });
};

const getSection = (sections: ProjectSection[], ...titles: string[]) => {
  const normalizedTitles = titles.map((title) => title.toLowerCase());
  return sections.find((section) => normalizedTitles.includes(section.title.toLowerCase()));
};

const firstParagraph = (section?: ProjectSection) =>
  section?.entries.flatMap((entry) => entry.paragraphs).find(Boolean) ?? "";

const firstBullets = (section?: ProjectSection, limit = 3) =>
  section?.entries.flatMap((entry) => entry.bullets).slice(0, limit) ?? [];

const collectStack = (section?: ProjectSection) => {
  const values = section?.entries.flatMap((entry) => entry.bullets) ?? [];
  return Array.from(new Set(values)).slice(0, 8);
};

const collectLinks = (section?: ProjectSection) =>
  (section?.entries.flatMap((entry) => entry.bullets) ?? [])
    .map((item) => {
      const match = item.match(/^([^:]+):\s*<?(https?:\/\/[^>\s]+)>?$/i);
      if (!match) {
        return null;
      }

      return {
        label: cleanInline(match[1]),
        href: match[2]
      };
    })
    .filter((item): item is { label: string; href: string } => Boolean(item));

const monthShortMap: Record<string, string> = {
  Januari: "Jan",
  Februari: "Feb",
  Maret: "Mar",
  April: "Apr",
  Mei: "Mei",
  Juni: "Jun",
  Juli: "Jul",
  Agustus: "Agu",
  September: "Sep",
  Oktober: "Okt",
  November: "Nov",
  Desember: "Des"
};

const shortenPeriod = (period: string) =>
  period.replace(
    /\b(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\b/g,
    (month) => monthShortMap[month] ?? month
  );

const parseSortableDate = (value: string) => {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const hiddenSectionTitles = new Set([
  "project period",
  "periode project",
  "repository"
]);

const projectDir = path.join(dataDir, "project");
const projectFolders = readDir(projectDir).filter((d) => d.isDirectory());

const screenshotsByProject: Record<string, ProjectScreenshot[]> = {};
const logosByProject: Record<string, ProjectLogo> = {};

for (const folder of projectFolders) {
  const { slug } = parseProjectFolder(folder.name);
  const folderPath = path.join(projectDir, folder.name);
  
  const screenshotsDir = path.join(folderPath, "screenshots");
  const screenshotFiles = readDir(screenshotsDir)
    .filter((f) => f.isFile() && /\.(png|jpg|jpeg|webp)$/i.test(f.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  screenshotsByProject[slug] = screenshotFiles.map((f, idx) => {
    const filePath = path.join(screenshotsDir, f.name);
    const dims = getImageDimensions(filePath);
    return {
      src: `/data/project/${folder.name}/screenshots/${f.name}`,
      alt: `${humanizeSlug(slug)} screenshot ${idx + 1}`,
      width: dims.width,
      height: dims.height
    };
  });

  const logoDir = path.join(folderPath, "logo");
  const logoFiles = readDir(logoDir).filter((f) => f.isFile() && /\.(png|jpg|jpeg|webp|svg)$/i.test(f.name));
  if (logoFiles.length > 0) {
    const logoFile = logoFiles[0];
    const logoPath = path.join(logoDir, logoFile.name);
    const isSvg = logoFile.name.endsWith(".svg");
    logosByProject[slug] = {
      src: `/data/project/${folder.name}/logo/${logoFile.name}`,
      alt: `${humanizeSlug(slug)} logo`,
      ...(isSvg ? {} : getImageDimensions(logoPath))
    };
  }
}

const certificationsDir = path.join(dataDir, "certifications");
const certificationFolders = readDir(certificationsDir).filter((d) => d.isDirectory());

const imagesByCertification: Record<string, CertificateImage> = {};

for (const folder of certificationFolders) {
  const slug = folder.name;
  const folderPath = path.join(certificationsDir, folder.name);
  const imageFiles = readDir(folderPath).filter(
    (f) => f.isFile() && /^certificate\.(png|jpg|jpeg|webp)$/i.test(f.name)
  );
  
  if (imageFiles.length > 0) {
    const imgFile = imageFiles[0];
    const imgPath = path.join(folderPath, imgFile.name);
    const dims = getImageDimensions(imgPath);
    imagesByCertification[slug] = {
      src: `/data/certifications/${folder.name}/${imgFile.name}`,
      alt: `${humanizeSlug(slug)} certificate preview`,
      width: dims.width,
      height: dims.height
    };
  }
}

const projectItems: ProjectItem[] = projectFolders
  .map((folder) => {
    const folderPath = path.join(projectDir, folder.name);
    const markdownPath = path.join(folderPath, "project.md");
    const markdown = readFile(markdownPath);
    if (!markdown) return null;

    const { slug, sortOrder } = parseProjectFolder(folder.name);

    const { metadata, body } = parseFrontmatter(markdown);
    const title = cleanInline(body.match(/^#\s+(.+)$/m)?.[1] ?? humanizeSlug(slug));
    const sections = parseSections(body);
    const period = firstParagraph(getSection(sections, "Project Period", "Periode Project")) || "In progress";
    const shortVersion =
      firstParagraph(getSection(sections, "Short Portfolio Version", "Versi Singkat untuk Portofolio")) ||
      firstParagraph(getSection(sections, "Quick Summary", "Ringkasan Singkat")) ||
      "Project details will be added soon.";
    const highlight =
      firstParagraph(getSection(sections, "Problem Solved", "Problems Solved", "Problem yang Diselesaikan")) ||
      shortVersion;
    const details =
      firstBullets(getSection(sections, "Key Features", "Fitur Utama"), 4).length > 0
        ? firstBullets(getSection(sections, "Key Features", "Fitur Utama"), 4)
        : firstBullets(getSection(sections, "Medium Version for CV or LinkedIn", "Versi Menengah untuk CV atau LinkedIn"), 4);
    const visibleSections = sections.filter((section) => !hiddenSectionTitles.has(section.title.toLowerCase()));

    return {
      id: slug,
      sortOrder,
      title,
      summary: shortVersion,
      featured: metadata.featured === true,
      projectType: normalizeProjectType(metadata.projectType),
      appType: normalizeProjectAppType(metadata.appType),
      period,
      periodShort: shortenPeriod(period),
      stack: collectStack(getSection(sections, "Tech Stack")),
      highlight,
      details,
      links: collectLinks(getSection(sections, "Repository")),
      logo: logosByProject[slug],
      sections: visibleSections,
      screenshots: screenshotsByProject[slug] ?? []
    };
  })
  .filter((item): item is NonNullable<typeof item> => Boolean(item))
  .sort((left, right) => right.sortOrder - left.sortOrder)
  .map(({ sortOrder: _sortOrder, ...project }) => project);

const certificateItems: CertificateItem[] = certificationFolders
  .map((folder) => {
    const folderPath = path.join(certificationsDir, folder.name);
    const markdownPath = path.join(folderPath, "certificate.md");
    const markdown = readFile(markdownPath);
    if (!markdown) return null;

    const slug = folder.name;

    const { metadata, body } = parseFrontmatter(markdown);
    const title = String(metadata.title ?? cleanInline(body.match(/^#\s+(.+)$/m)?.[1] ?? `Certificate ${slug}`));
    const summary = extractSectionParagraphs(body, "Quick Summary")[0] ?? "Certificate summary will be added soon.";
    const relevance = extractSectionParagraphs(body, "Relevance")[0] ?? "More context will be added soon.";
    const details = extractSectionBullets(body, "What This Certificate Represents");
    const issuerNotes = extractSectionBullets(body, "Issuer");

    return {
      id: slug,
      title,
      featured: metadata.featured === true,
      issuer: String(metadata.issuer ?? issuerNotes[0] ?? "Unknown issuer"),
      issued: String(metadata.issued ?? "Unknown date"),
      type: String(metadata.type ?? "Certificate"),
      summary,
      details,
      relevance,
      issuerNotes,
      image: imagesByCertification[slug]
    };
  })
  .filter((item): item is NonNullable<typeof item> => Boolean(item))
  .sort((left, right) => parseSortableDate(right.issued) - parseSortableDate(left.issued));

const workExperienceDir = path.join(dataDir, "work-experience");
const workExperienceFiles = readDir(workExperienceDir)
  .filter((f) => f.isFile() && f.name.startsWith("experience-") && f.name.endsWith(".md"))
  .map((f) => readFile(path.join(workExperienceDir, f.name)))
  .filter((content): content is string => Boolean(content));

const workExperiences: WorkExperienceItem[] = workExperienceFiles
  .map((markdown) => {
    const { metadata, body } = parseFrontmatter(markdown);
    const summary = extractSectionParagraphs(body, "Summary")[0] ?? "Experience summary will be added soon.";
    const highlights = extractSectionBullets(body, "Highlights");

    return {
      company: String(metadata.company ?? "Unknown Company"),
      location: String(metadata.location ?? "Unknown Location"),
      role: String(metadata.role ?? "Unknown Role"),
      start: String(metadata.start ?? ""),
      end: String(metadata.end ?? ""),
      period: String(metadata.period ?? ""),
      order: Number(metadata.order ?? 0),
      summary,
      highlights
    };
  })
  .sort((left, right) => left.order - right.order);

const fallbackProjects = ["otolog", "shou"]
  .filter((slug) => !projectItems.some((item) => item.id === slug))
  .map((slug) => ({
    id: slug,
    title: humanizeSlug(slug),
    summary: "Details will be added soon.",
    featured: false,
    projectType: "personal" as ProjectType,
    appType: "mobile" as ProjectAppType,
    period: "In progress",
    periodShort: "In progress",
    stack: [],
    highlight: "Project documentation is still being prepared.",
    details: ["Project markdown is not filled yet."],
    links: [],
    logo: logosByProject[slug],
    sections: [
      {
        title: "Status",
        entries: [
          {
            paragraphs: ["Project markdown is still empty. Add content in project.md to populate this modal automatically."],
            bullets: [],
            codeBlocks: []
          }
        ]
      }
    ],
    screenshots: screenshotsByProject[slug] ?? []
  })) satisfies ProjectItem[];

export const portfolio = {
  name: aboutData.name,
  role: aboutData.role,
  location: contactData.location,
  intro: aboutData.intro,
  about: aboutData.paragraphs,
  openToOpportunities: aboutData.openToOpportunities,
  skills: aboutData.skills,
  tech: aboutData.tech,
  softSkills: aboutData.softSkills,
  photo: {
    src: "/data/myself/me.jpg",
    alt: "Portrait of Argya Aulia Fauzandika",
    width: 400,
    height: 500
  },
  heroLinks: [
    {
      label: "View my work",
      href: "#projects",
      kind: "primary",
      note: "Jump to selected work."
    },
    {
      label: "Download CV",
      href: contactData.cv,
      kind: "secondary",
      note: "Open the local PDF viewer for my latest CV."
    }
  ] satisfies PortfolioLink[],
  directoryLinks: [
    {
      title: "CV",
      value: "Resume download",
      href: contactData.cv,
      caption: "Open the local PDF viewer for the latest resume."
    },
    {
      title: "Play Store Developer",
      value: "Developer profile",
      href: contactData.playStore,
      caption: "Publisher or app listing link."
    },
    {
      title: "GitHub",
      value: "Code archive",
      href: contactData.github,
      caption: "Code, experiments, and shipped work."
    },
    {
      title: "LinkedIn",
      value: "Professional profile",
      href: contactData.linkedin,
      caption: "Career timeline and networking profile."
    },
    {
      title: "WhatsApp",
      value: "Quick chat",
      href: contactData.whatsapp,
      caption: "Fastest contact for direct conversation."
    },
    {
      title: "Email",
      value: contactData.email,
      href: `mailto:${contactData.email}`,
      caption: "Best for collaboration and freelance inquiries."
    }
  ],
  projects: [...projectItems, ...fallbackProjects] satisfies ProjectItem[],
  certificates: certificateItems,
  workExperiences
};

export const featuredProjects = portfolio.projects.filter((project) => project.featured).slice(0, 3);
export const regularProjects = portfolio.projects.filter(
  (project) => !project.featured || !featuredProjects.some((featured) => featured.id === project.id)
);
const manualFeaturedCertificates = portfolio.certificates.filter((certificate) => certificate.featured);
const fallbackFeaturedCertificates = portfolio.certificates.filter(
  (certificate) => !manualFeaturedCertificates.some((featured) => featured.id === certificate.id)
);
export const featuredCertificates = [...manualFeaturedCertificates, ...fallbackFeaturedCertificates].slice(0, 3);
export const regularCertificates = portfolio.certificates.filter(
  (certificate) => !featuredCertificates.some((featured) => featured.id === certificate.id)
);
export const portfolioProjects = portfolio.projects;
export const portfolioCertificates = portfolio.certificates;
