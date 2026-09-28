import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, Download } from "lucide-react";
import type { AppItem, CertificateItem, Contact, NoteItem, Profile, SkillCategory, WorkExperienceItem } from "@/data/types";
import { resolveHomeSections, visibleSkillCategories, type PublishedSection, type ResolvedHomeSection } from "@/lib/public-content";

type HomeProps = {
  profile: Profile;
  contact: Contact;
  apps: AppItem[];
  certificates: CertificateItem[];
  experience: WorkExperienceItem[];
  skills: SkillCategory[];
  notes: NoteItem[];
  sections: ResolvedHomeSection[];
  hasConfiguredSections: boolean;
};

function Heading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string }) {
  return <header className="editorial-heading"><span>{eyebrow}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</header>;
}

function AppTile({ app }: { app: AppItem }) {
  const image = app.screenshots[0]?.src || app.thumbnailSrc;
  const alt = app.screenshots[0]?.alt || app.thumbnailAlt;
  return <Link href={`/apps/${app.slug}`} className="editorial-app-tile"><div className="editorial-app-image"><Image src={image} alt={alt} fill sizes="(min-width: 900px) 33vw, 100vw" className="object-cover object-top" /></div><small>{[app.appType, app.category || app.workType].filter(Boolean).join(" · ")}</small><h3>{app.title}</h3><p>{app.tagline}</p><span>View case study <ArrowUpRight size={15} /></span></Link>;
}

function Hero({ profile, app, section }: { profile: Profile; app?: AppItem; section?: PublishedSection }) {
  const image = app?.screenshots[0]?.src || app?.thumbnailSrc || profile.photoSrc;
  const alt = app?.screenshots[0]?.alt || app?.thumbnailAlt || profile.photoAlt;
  const title = section?.headline || profile.role || "Mobile apps built with care.";
  const copy = section?.subheadline || profile.intro;
  const metrics = section?.metrics ?? [];
  return <section id="hero" className="editorial-hero"><div className="editorial-hero-copy"><span className="editorial-eyebrow">MOBILE DEVELOPER · {profile.location}</span><h1>{title}</h1><p>{copy}</p><div className="editorial-actions"><Link href="#work" className="editorial-button editorial-button-dark">Explore selected work <ArrowDown size={16} /></Link><Link href="/cv" className="editorial-button">Download CV <Download size={16} /></Link></div>{metrics.length ? <dl className="editorial-metrics">{metrics.map((metric) => <div key={metric.label}><dt>{metric.value}</dt><dd>{metric.label}</dd></div>)}</dl> : null}</div><div className="editorial-hero-visual"><div className="editorial-hero-image"><Image src={image} alt={alt} fill priority sizes="(min-width: 900px) 40vw, 88vw" className="object-cover object-top" /></div>{app && <span>{app.title}</span>}</div></section>;
}

function About({ profile, skills }: { profile: Profile; skills: SkillCategory[] }) {
  return <section id="about" className="editorial-section editorial-about"><div><Heading eyebrow="ABOUT / 02" title="I care about the details people should not have to think about." /><p className="editorial-byline">{profile.name} · {profile.role}</p></div><div><p className="editorial-lede">{profile.intro}</p><div className="editorial-skill-groups">{skills.map((group) => <div key={group.id}><span>{group.name}</span><p>{group.items.join(" · ")}</p></div>)}</div></div></section>;
}

function Experience({ experience }: { experience: WorkExperienceItem[] }) {
  return <section id="experience" className="editorial-section editorial-experience"><div><Heading eyebrow="EXPERIENCE / 03" title="Good work is a team sport." /><p className="editorial-stat">{experience.length}<small>roles published</small></p></div><ol>{experience.map((item) => <li key={item.id}><span>{item.period}</span><div><h3>{item.role}</h3><p>{item.company}{item.location ? ` · ${item.location}` : ""}</p><p>{item.summary}</p></div></li>)}</ol></section>;
}

function Skills({ skills, section }: { skills: SkillCategory[]; section?: PublishedSection }) {
  return <section id="skills" className="editorial-section editorial-dark editorial-skills"><div className="editorial-skills-layout"><Heading eyebrow={section?.label || "TOOLS / 04"} title={section?.headline || "The craft behind the calm."} copy={section?.subheadline} /><div className="editorial-skill-rows">{skills.map((group, index) => <article key={group.id}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{group.name.replace(/([a-z])([A-Z])/g, "$1 $2")}</h3><p>{group.items.join(" · ")}</p></div></article>)}</div></div></section>;
}

function Certificates({ certificates }: { certificates: CertificateItem[] }) {
  return <section id="certificates" className="editorial-section editorial-certificates"><Heading eyebrow="LEARNING / 05" title="Learning is part of the work." /><div>{certificates.map((certificate) => <Link href={`/certificates/${certificate.id}`} key={certificate.id}><span>{certificate.type}</span><h3>{certificate.title}</h3><p>{certificate.issuer} · {certificate.issued}</p><ArrowUpRight size={16} /></Link>)}</div></section>;
}

function Notes({ notes }: { notes: NoteItem[] }) {
  return <section id="notes" className="editorial-section editorial-dark editorial-notes"><Heading eyebrow="FIELD NOTES / 06" title="Thinking out loud." copy="Notes on product craft, engineering choices, and making space for good work." /><div>{notes.slice(0, 3).map((note) => <Link href={`/blog/${note.slug}`} key={note.id}><div className="editorial-note-cover">{note.coverSrc ? <Image src={note.coverSrc} alt="" fill sizes="(min-width: 900px) 33vw, 100vw" className="object-cover" /> : null}</div><small>{note.tags.join(" · ")}</small><h3>{note.title}</h3><p>{note.summary}</p><span>Read article <ArrowUpRight size={15} /></span></Link>)}</div>{notes.length ? <Link href="/blog" className="editorial-text-link">Browse all notes <ArrowUpRight size={15} /></Link> : null}</section>;
}

function Contact({ profile, contact }: { profile: Profile; contact: Contact }) {
  return <section id="contact" className="editorial-contact">
    <span className="editorial-contact-eyebrow">AVAILABLE FOR THOUGHTFUL COLLABORATIONS</span>
    <div className="editorial-contact-layout">
      <div className="editorial-contact-copy">
        <h2>Let&apos;s make something feel effortless.</h2>
        <p>Have a mobile product in mind? I can help shape the architecture, ship the first version, or untangle the hard parts.</p>
      </div>
      <div className="editorial-contact-action">
        <Link className="editorial-button" href={`mailto:${contact.email}`}>Start a conversation <ArrowUpRight size={16} /></Link>
        <div className="editorial-contact-details">
          <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
          <span>{profile.location}</span>
          {contact.github ? <Link href={contact.github} target="_blank" rel="noreferrer">GitHub ↗</Link> : null}
        </div>
      </div>
    </div>
  </section>;
}

export function EditorialHome({ profile, contact, apps, certificates, experience, skills, notes, sections, hasConfiguredSections }: HomeProps) {
  const visible = resolveHomeSections(sections, hasConfiguredSections);
  const displayedSkills = visibleSkillCategories(skills);
  const hero = visible.find((section) => section.id === "hero");
  const heroApp = apps.find((app) => app.id === hero?.heroAppId) ?? apps[0];
  const content: Record<string, React.ReactNode> = {
    hero: <Hero profile={profile} app={heroApp} section={hero} />,
    work: <section id="work" className="editorial-section editorial-work"><Heading eyebrow="SELECTED WORK / 01" title="Apps made for real life." copy={visible.find((section) => section.id === "work")?.subheadline} /><div>{apps.slice(0, 3).map((app) => <AppTile app={app} key={app.id} />)}</div><Link className="editorial-text-link" href="/apps">View all apps <ArrowUpRight size={15} /></Link></section>,
    apps: <section id="apps" className="editorial-section editorial-work"><Heading eyebrow="APP CATALOG" title="More shipped work." /><div>{apps.slice(0, 3).map((app) => <AppTile app={app} key={app.id} />)}</div></section>,
    about: <About profile={profile} skills={skills} />,
    experience: <Experience experience={experience} />,
    skills: displayedSkills.length ? <Skills skills={displayedSkills} section={visible.find((section) => section.id === "skills")} /> : null,
    certificates: <Certificates certificates={certificates} />,
    notes: <Notes notes={notes} />,
    contact: <Contact profile={profile} contact={contact} />,
  };
  return <main id="main-content">{visible.map((section) => content[section.id] ? <div key={section.id}>{content[section.id]}</div> : null)}</main>;
}
