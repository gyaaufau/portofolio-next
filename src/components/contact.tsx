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
    <div className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
      {/* Primary: Email */}
      {primaryAction && (
        <Link
          href={primaryAction.href}
          target={primaryAction.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={primaryAction.href.startsWith("mailto:") ? undefined : "noreferrer"}
          className="flex items-start gap-4 p-5 transition-colors hover:bg-secondary group"
        >
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
            <Mail className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">{primaryAction.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{primaryAction.note}</p>
          </div>
          <ExternalLink className="size-4 text-muted shrink-0 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      )}

      {/* Secondary: 2-col grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {secondaryActions.slice(0, 4).map((action) => {
          const Icon = iconMap[action.label] || ExternalLink;
          return (
            <Link
              key={action.label}
              href={action.href}
              target={isExternalLink(action.href) ? "_blank" : undefined}
              rel={isExternalLink(action.href) ? "noreferrer" : undefined}
              className="flex items-start gap-4 p-5 transition-colors hover:bg-secondary group border-t sm:border-t border-border [&:nth-child(odd)]:sm:border-r"
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
      </div>

      {/* CV: full width */}
      {(() => {
        const cvAction = actions.find((a) => a.label === "CV");
        if (!cvAction) return null;
        return (
          <Link
            href={cvAction.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-4 p-5 transition-colors hover:bg-secondary group border-t border-border"
          >
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
              <FileText className="size-5" />
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
