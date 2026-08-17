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
    <main id="main-content" className="mx-auto w-full max-w-[1080px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <BackLink href={`/apps/${slug}`} label={app.title} />

      <div className="mt-8">
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-2">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Account Deletion</h1>
        <p className="text-muted-foreground text-sm mb-8">{app.title}</p>

        {app.accountDeletionRequiresAuth && (
          <div className="mb-8 flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
            <ShieldAlert className="size-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-500">Authentication Required</p>
              <p className="text-sm text-muted-foreground mt-1">
                You must be signed in to your account to request deletion.
              </p>
            </div>
          </div>
        )}

        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: app.accountDeletionContent }}
        />
      </div>
    </main>
  );
}
