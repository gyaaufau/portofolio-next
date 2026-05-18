import { Hero } from "@/components/hero";
import { SectionShell } from "@/components/section-shell";
import { Projects } from "@/components/projects";
import { WorkExperience } from "@/components/work-experience";
import { About } from "@/components/about";
import { Certificates } from "@/components/certificates";
import { Contact } from "@/components/contact";
import { featuredCertificates, featuredProjects, portfolio } from "@/data/portfolio";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const contactMap = Object.fromEntries(portfolio.directoryLinks.map((link) => [link.title, link.href]));
  const contactValueMap = Object.fromEntries(portfolio.directoryLinks.map((link) => [link.title, link.value]));

  return (
    <main id="top" className="relative w-full max-w-[1280px] mx-auto px-6 pt-6 pb-20">
      <Hero
        name={portfolio.name}
        role={portfolio.role}
        intro={portfolio.intro}
        location={portfolio.location}
        openToOpportunities={portfolio.openToOpportunities}
        links={portfolio.heroLinks}
        photo={portfolio.photo}
      />

      <SectionShell
        id="projects"
        eyebrow="01 // selected work"
        title="Selected work."
        description="A few projects I want to highlight."
      >
        {featuredProjects.length > 0 && (
          <Projects projects={featuredProjects} />
        )}
        <div className="mt-6 rounded-3xl p-6 bg-card border border-border flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">Other Projects</h3>
            <p className="mt-1 text-sm text-muted-foreground">Full archive of featured and regular work.</p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 border border-border text-sm font-semibold bg-card text-foreground hover:bg-secondary hover:border-muted transition-all shrink-0" href="/projects">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </SectionShell>

      <SectionShell
        id="work-experience"
        eyebrow="02 // experience"
        title="Work experience."
        description="A quick timeline of professional work from earliest to latest."
      >
        <WorkExperience experiences={portfolio.workExperiences} />
      </SectionShell>

      <SectionShell
        id="about"
        eyebrow="03 // about"
        title="About me."
        description="A short introduction about my background and work."
      >
        <About
          paragraphs={portfolio.about}
          skills={portfolio.skills}
          tech={portfolio.tech}
          softSkills={portfolio.softSkills}
        />
      </SectionShell>

      <SectionShell
        id="certificates"
        eyebrow="04 // certificates"
        title="Certificates."
        description="Selected training and conference milestones."
      >
        {featuredCertificates.length > 0 && (
          <Certificates certificates={featuredCertificates} />
        )}
        <div className="mt-6 rounded-3xl p-6 bg-card border border-border flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground">All Certificates</h3>
            <p className="mt-1 text-sm text-muted-foreground">Full archive with pinned and regular certificates.</p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 border border-border text-sm font-semibold bg-card text-foreground hover:bg-secondary hover:border-muted transition-all shrink-0" href="/certificates">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </SectionShell>

      <SectionShell
        id="contact"
        eyebrow="05 // contact"
        title="Contact."
        description="Simple ways to reach out."
      >
        <Contact
          email={String(contactValueMap["Email"] ?? "hello@example.com")}
          whatsapp={contactMap["WhatsApp"] ?? "https://wa.me/"}
          github={contactMap["GitHub"] ?? "https://github.com/"}
          linkedin={contactMap["LinkedIn"] ?? "https://linkedin.com/"}
          playConsole={contactMap["Play Store Developer"] ?? "https://play.google.com/store/"}
          cv={contactMap["CV"] ?? "https://drive.google.com/"}
        />
      </SectionShell>
    </main>
  );
}
