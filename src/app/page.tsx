import { Hero } from "@/components/hero";
import { SectionShell } from "@/components/section-shell";
import { AppCard } from "@/components/app-card";
import { WorkExperience } from "@/components/work-experience";
import { About } from "@/components/about";
import { Certificates } from "@/components/certificates";
import { Contact } from "@/components/contact";
import { getPortfolio, getFeaturedApps, getFeaturedCertificates } from "@/data/db";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const [portfolio, featuredApps, featuredCertificates] = await Promise.all([
    getPortfolio(),
    getFeaturedApps(),
    getFeaturedCertificates(),
  ]);

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
        id="apps"
        eyebrow="01 // selected work"
        title="Selected work."
        description="A few apps I want to highlight."
      >
        {featuredApps.length > 0 && (
          <div className="space-y-3">
            {featuredApps.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        )}
        <div className="mt-4 md:mt-6 rounded-2xl p-4 md:p-6 bg-card border border-border flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-foreground">All Apps</h3>
            <p className="mt-0.5 md:mt-1 text-sm text-muted-foreground">Full catalog of featured and regular apps.</p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-full px-4 py-2 md:px-5 md:py-2.5 border border-border text-sm font-semibold bg-card text-foreground hover:bg-secondary hover:border-muted transition-all shrink-0" href="/apps">
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
        <div className="mt-4 md:mt-6 rounded-2xl p-4 md:p-6 bg-card border border-border flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-foreground">All Certificates</h3>
            <p className="mt-0.5 md:mt-1 text-sm text-muted-foreground">Full archive with pinned and regular certificates.</p>
          </div>
          <Link className="inline-flex items-center gap-2 rounded-full px-4 py-2 md:px-5 md:py-2.5 border border-border text-sm font-semibold bg-card text-foreground hover:bg-secondary hover:border-muted transition-all shrink-0" href="/certificates">
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
