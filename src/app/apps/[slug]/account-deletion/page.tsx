import { getAppBySlug } from "@/data/db";
import { absoluteUrl } from "@/data/seo";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BackLink } from "@/components/back-link";
import { ShieldAlert } from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app || !app.hasAccountDeletion) {
    return { title: "Page Not Found" };
  }

  return {
    title: `Account Deletion - ${app.title} | Gialoop`,
    description: `Account deletion instructions for ${app.title}`,
    openGraph: {
      title: `Account Deletion - ${app.title} | Gialoop`,
      description: `Account deletion instructions for ${app.title}`,
      url: absoluteUrl(`/apps/${slug}/account-deletion`),
    },
  };
}

export default async function AccountDeletionPage({ params }: Props) {
  const { slug } = await params;
  const app = await getAppBySlug(slug);

  if (!app || !app.hasAccountDeletion) {
    notFound();
  }

  return (
    <main id="main-content" className="editorial-legal-page">
      <BackLink href={`/apps/${slug}`} label={app.title} />

      <div className="editorial-legal-content">
        <p>LEGAL</p>
        <h1>Account Deletion</h1>
        <p>{app.title}</p>

        {app.accountDeletionRequiresAuth && (
          <div className="editorial-legal-alert">
            <ShieldAlert size={20} />
            <div>
              <strong>Authentication Required</strong>
              <p>
                You must be signed in to your account to request deletion.
              </p>
            </div>
          </div>
        )}

        <div
          className="editorial-legal-prose"
          dangerouslySetInnerHTML={{ __html: app.accountDeletionContent }}
        />
      </div>
    </main>
  );
}
