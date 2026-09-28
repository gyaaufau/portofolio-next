import { getAppBySlug } from "@/data/db";
import { absoluteUrl } from "@/data/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app || !app.hasPrivacyPolicy) {
    return { title: "Page Not Found" };
  }

  return {
    title: `Privacy Policy - ${app.title} | Gialoop`,
    description: `Privacy policy for ${app.title}`,
    openGraph: {
      title: `Privacy Policy - ${app.title} | Gialoop`,
      description: `Privacy policy for ${app.title}`,
      url: absoluteUrl(`/apps/${slug}/privacy-policy`),
    },
  };
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app || !app.hasPrivacyPolicy) {
    notFound();
  }

  return (
    <main id="main-content" className="editorial-legal-page">
      <BackLink href={`/apps/${slug}`} label={app.title} />

      <div className="editorial-legal-content">
        <p>LEGAL</p>
        <h1>Privacy Policy</h1>
        <p>{app.title}</p>

        <div
          className="editorial-legal-prose"
          dangerouslySetInnerHTML={{ __html: app.privacyPolicyContent }}
        />
      </div>
    </main>
  );
}
