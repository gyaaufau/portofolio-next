import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionShell } from "@/components/section-shell";
import { AppCard } from "@/components/app-card";
import { WorkExperience } from "@/components/work-experience";
import { About } from "@/components/about";
import { Certificates } from "@/components/certificates";
import { Contact } from "@/components/contact";
import { getPortfolio } from "@/data/db";

export const revalidate = 3600;

export default async function Home() {
  const portfolio = await getPortfolio();
  return (
    <main id="main-content" className="w-full pb-20">
      <Hero name={portfolio.name} role={portfolio.role} intro={portfolio.intro} location={portfolio.location} openToOpportunities={portfolio.openToOpportunities} />

      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-6">
      <SectionShell id="apps" title="Apps worth opening." description="Production work and personal products, presented with the decisions and craft behind them.">
        <div className="border-t border-border">{portfolio.projects.map((app) => <AppCard key={app.id} app={app} />)}</div>
        <Link href="/apps" className="pixel-button mt-7 bg-card text-foreground">Browse all apps <ArrowRight className="size-4" /></Link>
      </SectionShell>

      <SectionShell id="work-experience" title="The quest log." description="Teams, roles, and the practical work completed along the way.">
        <WorkExperience experiences={portfolio.workExperiences} />
      </SectionShell>

      <SectionShell id="about" title="Tools in the inventory." description="A focused Flutter toolkit, backed by product thinking and reliable delivery.">
        <About paragraphs={portfolio.about} skills={portfolio.skills} tech={portfolio.tech} softSkills={portfolio.softSkills} photo={portfolio.photo} />
      </SectionShell>

      <SectionShell id="certificates" title="Achievements unlocked." description="Training and conference milestones that sharpened the work.">
        <Certificates certificates={portfolio.certificates} />
        <Link href="/certificates" className="pixel-button mt-7 bg-card text-foreground">View all certificates <ArrowRight className="size-4" /></Link>
      </SectionShell>

      <SectionShell id="contact" title="Ready for the next build?">
        <Contact email={portfolio.contact.email} whatsapp={portfolio.contact.whatsapp} github={portfolio.contact.github} linkedin={portfolio.contact.linkedin} playConsole={portfolio.contact.playStore} cv={portfolio.contact.cv} />
      </SectionShell>
      </div>
    </main>
  );
}
