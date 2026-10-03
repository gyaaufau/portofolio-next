import { getAppBySlug } from "@/data/db";
import { absoluteUrl } from "@/data/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { LegalContent } from "@/components/legal-content";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) return { title: "Page Not Found" };
  const title = `Support - ${app.title} | Gialoop`;
  const description = `Get help and support for ${app.title}`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(`/apps/${slug}/support`) },
    openGraph: { title, description, url: absoluteUrl(`/apps/${slug}/support`) },
  };
}

export default async function SupportPage({ params }: Props) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);
  if (!app) notFound();

  return (
    <main id="main-content" className="editorial-legal-page">
      <BackLink href={`/apps/${slug}`} label={app.title} />
      <div className="editorial-legal-content">
        <p>SUPPORT</p>
        <p className="editorial-legal-app-name">{app.title}</p>
        <div className="editorial-legal-prose">
          <h1>Support</h1>
          {!app.supportContent.trim() && <p>For help with {app.title}, contact us by email.</p>}
          <p>Contact: <a href={`mailto:${app.supportEmail}`}>{app.supportEmail}</a></p>
        </div>
        {app.supportContent.trim() && <LegalContent content={app.supportContent} />}
      </div>
    </main>
  );
}
