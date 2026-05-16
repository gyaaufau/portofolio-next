import { Navbar } from "@/components/navbar";
import { ProjectDetailView } from "@/components/project-detail-view";
import { portfolioProjects } from "@/data/portfolio";
import { absoluteUrl, siteConfig } from "@/data/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return portfolioProjects.map((project) => ({
    slug: project.id,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => p.id === slug);
  
  if (!project) {
    return {
      title: "Project Not Found | Gialoop",
    };
  }

  return {
    title: `${project.title} | Gialoop`,
    description: project.summary,
    openGraph: {
      title: `${project.title} | Gialoop`,
      description: project.summary,
      url: absoluteUrl(`/projects/${slug}`),
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = portfolioProjects.find((p) => p.id === slug);

  if (!project) {
    notFound();
  }

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/projects/${slug}`),
    author: {
      "@type": "Person",
      name: siteConfig.personName
    }
  };

  return (
    <main className="page-shell">
      <Navbar />

      <section className="project-page-top panel">
        <Link className="back-link" href="/projects">back / projects</Link>
      </section>

      <ProjectDetailView project={project} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectSchema),
        }}
      />
    </main>
  );
}
