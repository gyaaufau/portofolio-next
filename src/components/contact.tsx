import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness, Code2, MessageCircle, Store } from "lucide-react";

export function Contact({ email, whatsapp, github, linkedin, playConsole, cv }: { email: string; whatsapp: string; github: string; linkedin: string; playConsole: string; cv: string }) {
  const links = [
    { label: "WhatsApp", href: whatsapp, icon: MessageCircle },
    { label: "GitHub", href: github, icon: Code2 },
    { label: "LinkedIn", href: linkedin, icon: BriefcaseBusiness },
    { label: "Play Store", href: playConsole, icon: Store },
  ];
  return (
    <div className="pixel-frame grid overflow-hidden bg-card lg:grid-cols-[1.2fr_0.8fr]">
      <div className="pixel-grid p-6 md:p-10">
        <p className="text-pixel text-[9px] text-primary">NEW QUEST?</p>
        <h3 className="mt-5 max-w-[12ch] text-3xl font-semibold leading-tight tracking-[-0.04em] md:text-5xl">Let&apos;s build something useful.</h3>
        <p className="mt-4 max-w-[50ch] leading-7 text-muted-foreground">For Flutter products, architecture work, or a thoughtful collaboration, email is the best place to start.</p>
        <Link href={`mailto:${email}`} className="pixel-button mt-7 bg-primary text-primary-foreground">Email me <ArrowUpRight className="size-4" /></Link>
        <Link href={cv} className="ml-4 text-sm font-semibold text-muted-foreground hover:text-primary">Read CV</Link>
      </div>
      <div className="divide-y divide-border border-t border-border lg:border-l lg:border-t-0">
        {links.map(({ label, href, icon: Icon }) => (
          <Link key={label} href={href} target="_blank" rel="noreferrer" className="group flex items-center gap-4 p-5 transition-colors hover:bg-secondary md:p-6">
            <Icon className="size-5 text-primary" /><span className="font-medium">{label}</span><ArrowUpRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
