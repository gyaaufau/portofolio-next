import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/hero";
import { SectionShell } from "@/components/section-shell";
import { AppCard } from "@/components/app-card";
import { WorkExperience } from "@/components/work-experience";
import { About } from "@/components/about";
import { Certificates } from "@/components/certificates";
import { Contact } from "@/components/contact";
import { PixelOrnament } from "@/components/pixel-ornament";
import { getPortfolio } from "@/data/db";

export const dynamic = "force-dynamic";

export default async function Home() {
  const portfolio = await getPortfolio();
  return (
    <main id="main-content" className="w-full pb-20">
      <Hero name={portfolio.name} role={portfolio.role} intro={portfolio.intro} location={portfolio.location} openToOpportunities={portfolio.openToOpportunities} />

      <div className="mx-auto w-full max-w-[1280px] px-5 md:px-6">
      <SectionShell
        id="apps"
        title="Apps worth opening."
        description="Production work and personal products, presented with the decisions and craft behind them."
        headingAdornment={<PixelOrnament name="reclaimed-computer-folder" className="w-12" />}
      >
        <div className="border-t border-border">{portfolio.projects.map((app) => <AppCard key={app.id} app={app} />)}</div>
        <Link href="/apps" className="pixel-button mt-7 bg-card text-foreground">Browse all apps <ArrowRight className="size-4" /></Link>
      </SectionShell>

      <SectionShell id="work-experience" title="The quest log." description="Teams, roles, and the practical work completed along the way.">
        <WorkExperience experiences={portfolio.workExperiences} />
      </SectionShell>

      <SectionShell
        id="about"
        title="Tools in the inventory."
        description="A focused Flutter toolkit, backed by product thinking and reliable delivery."
        asideAdornment={<PixelOrnament name="abandoned-workstation-window" className="w-48" />}
      >
        <About paragraphs={portfolio.about} skills={portfolio.skills} tech={portfolio.tech} softSkills={portfolio.softSkills} photo={portfolio.photo} />
      </SectionShell>

      <SectionShell id="certificates" title="Achievements unlocked." description="Training and conference milestones that sharpened the work.">
        <Certificates certificates={portfolio.certificates} />
        <Link href="/certificates" className="pixel-button mt-7 bg-card text-foreground">View all certificates <ArrowRight className="size-4" /></Link>
        <div className="mt-7 flex justify-center overflow-hidden md:mt-10">
          <PixelOrnament name="weathered-conduit" className="w-96 shrink-0 md:w-[48rem]" />
        </div>
      </SectionShell>

      <SectionShell id="contact" title="Ready for the next build?">
        <div className="relative">
          <div className="relative z-[1]">
            <Contact email={portfolio.contact.email} whatsapp={portfolio.contact.whatsapp} github={portfolio.contact.github} linkedin={portfolio.contact.linkedin} playConsole={portfolio.contact.playStore} cv={portfolio.contact.cv} />
          </div>
          <PixelOrnament name="mossy-masonry-vine" className="relative z-0 ml-auto -mt-8 w-32 md:-mt-20 md:w-64" />
        </div>
      </SectionShell>
      </div>
    </main>
  );
}
