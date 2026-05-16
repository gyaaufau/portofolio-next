import Link from "next/link";

interface ContactProps {
  email: string;
  whatsapp: string;
  github: string;
  linkedin: string;
  playConsole: string;
  cv: string;
}

const isExternalLink = (href: string) => href.startsWith("http://") || href.startsWith("https://");

export function Contact({ email, whatsapp, github, linkedin, playConsole, cv }: ContactProps) {
  const actions = [
    {
      label: "Email",
      value: email,
      href: `mailto:${email}`,
      note: "For projects, freelance work, and professional collaboration.",
      primary: true as const
    },
    {
      label: "WhatsApp",
      value: "Quick chat",
      href: whatsapp,
      note: "Casual and fast replies",
      primary: false as const
    },
    {
      label: "GitHub",
      value: "Repos",
      href: github,
      note: "Code and experiments",
      primary: false as const
    },
    {
      label: "LinkedIn",
      value: "Profile",
      href: linkedin,
      note: "Professional profile",
      primary: false as const
    },
    {
      label: "Play Store Developer",
      value: "Apps",
      href: playConsole,
      note: "Published apps",
      primary: false as const
    },
    {
      label: "CV",
      value: "Resume",
      href: cv,
      note: "Experience summary",
      primary: false as const
    }
  ];

  const primaryAction = actions.find((action) => action.primary);
  const secondaryActions = actions.filter((action) => !action.primary);

  return (
    <div className="contact-shell bento-grid">
      {primaryAction && (
        <Link
          className="contact-primary-card bento-item bento-span-2 reveal"
          href={primaryAction.href}
          target={primaryAction.href.startsWith("mailto:") ? undefined : "_blank"}
          rel={primaryAction.href.startsWith("mailto:") ? undefined : "noreferrer"}
        >
          <p className="section-label">{primaryAction.label}</p>
          <h3>{primaryAction.value}</h3>
          <p>{primaryAction.note}</p>
          <span className="contact-primary-cta">Send email</span>
        </Link>
      )}
      
      {secondaryActions.map((action, index) => (
        <Link
          key={action.label}
          className={`contact-link-card bento-item reveal reveal-delay-${Math.min(index + 1, 6)}`}
          href={action.href}
          target={isExternalLink(action.href) ? "_blank" : undefined}
          rel={isExternalLink(action.href) ? "noreferrer" : undefined}
        >
          <span>{action.label}</span>
          <strong>{action.value}</strong>
          <small>{action.note}</small>
        </Link>
      ))}
    </div>
  );
}
