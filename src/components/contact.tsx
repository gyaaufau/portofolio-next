import Link from "next/link";
import { Mail, MessageCircle, Code2, Briefcase, Smartphone, FileText, ExternalLink } from "lucide-react";

interface ContactProps {
  email: string;
  whatsapp: string;
  github: string;
  linkedin: string;
  playConsole: string;
  cv: string;
}

const isExternalLink = (href: string) => href.startsWith("http://") || href.startsWith("https://");

const iconMap: Record<string, React.ElementType> = {
  Email: Mail,
  WhatsApp: MessageCircle,
  GitHub: Code2,
  LinkedIn: Briefcase,
  "Play Store Developer": Smartphone,
  CV: FileText,
};

export function Contact({ email, whatsapp, github, linkedin, playConsole, cv }: ContactProps) {
  const actions = [
    {
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      note: "For projects, freelance work, and professional collaboration.",
      primary: true as const,
    },
    {
      label: "WhatsApp",
      value: "Quick chat",
      href: whatsapp,
      note: "Casual and fast replies",
      primary: false as const,
    },
    {
      label: "GitHub",
      value: "Repos",
      href: github,
      note: "Code and experiments",
      primary: false as const,
    },
    {
      label: "LinkedIn",
      value: "Profile",
      href: linkedin,
      note: "Professional profile",
      primary: false as const,
    },
    {
      label: "Play Store Developer",
      value: "Apps",
      href: playConsole,
      note: "Published apps",
      primary: false as const,
    },
    {
      label: "CV",
      value: "Resume",
      href: cv,
      note: "Experience summary",
      primary: false as const,
    },
  ];

  const primaryAction = actions.find((a) => a.primary);
  const secondaryActions = actions.filter((a) => !a.primary);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Email — teal hero block, taller on desktop */}
      {primaryAction && (
        <Link
          href={primaryAction.href}
          className="rounded-3xl bg-primary text-primary-foreground p-6 md:row-span-2 flex flex-col justify-between transition-all hover:brightness-110 group"
        >
          <div>
            <div className="flex items-center justify-center size-12 rounded-full bg-primary-foreground/15 mb-4">
              <Mail className="size-6" />
            </div>
            <p className="text-2xl font-bold break-all">{primaryAction.value}</p>
            <p className="text-sm text-primary-foreground/70 mt-2">{primaryAction.note}</p>
          </div>
          <ExternalLink className="size-5 ml-auto mt-6 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      )}

      {/* Secondary items: WhatsApp, GitHub, LinkedIn, Play Store */}
      {secondaryActions.slice(0, 4).map((action) => {
        const Icon = iconMap[action.label] || ExternalLink;
        return (
          <Link
            key={action.label}
            href={action.href}
            target={isExternalLink(action.href) ? "_blank" : undefined}
            rel={isExternalLink(action.href) ? "noreferrer" : undefined}
            className="rounded-3xl bg-card border border-border p-5 flex items-start gap-4 transition-all hover:bg-secondary group"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-secondary text-muted shrink-0 mt-0.5">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{action.note}</p>
            </div>
            <ExternalLink className="size-4 text-muted shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        );
      })}

      {/* CV — full width */}
      {(() => {
        const cvAction = actions.find((a) => a.label === "CV");
        if (!cvAction) return null;
        const Icon = iconMap[cvAction.label] || ExternalLink;
        return (
          <Link
            href={cvAction.href}
            target="_blank"
            rel="noreferrer"
            className="md:col-span-2 rounded-3xl bg-card border border-border p-5 flex items-start gap-4 transition-all hover:bg-secondary group"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <Icon className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{cvAction.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{cvAction.note}</p>
            </div>
            <ExternalLink className="size-4 text-muted shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        );
      })()}
    </div>
  );
}
