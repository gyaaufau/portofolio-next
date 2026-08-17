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
    <main id="main-content" className="mx-auto w-full max-w-[1080px] px-5 pb-20 pt-10 md:px-6 md:pt-16">
      <BackLink href={`/apps/${slug}`} label={app.title} />

      <div className="mt-8">
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-2">Legal</p>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground text-sm mb-8">{app.title}</p>

        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: app.privacyPolicyContent }}
        />
      </div>
    </main>
  );
}
