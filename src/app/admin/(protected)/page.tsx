import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AppWindow, Award, Briefcase, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [appCount, certCount, workCount, featuredCount] = await Promise.all([
    prisma.app.count(),
    prisma.certificate.count(),
    prisma.workExperience.count(),
    prisma.app.count({ where: { featured: true } }),
  ]);

  const stats = [
    { label: "Apps", value: appCount, icon: AppWindow, href: "/admin/apps" },
    { label: "Certificates", value: certCount, icon: Award, href: "/admin/certificates" },
    { label: "Work Experience", value: workCount, icon: Briefcase, href: "/admin/work-experience" },
    { label: "Featured Apps", value: featuredCount, icon: Star, href: "/admin/apps" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">overview</p>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="p-5 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/apps/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <AppWindow className="size-4" />
            New App
          </Link>
          <Link
            href="/admin/certificates/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Award className="size-4" />
            New Certificate
          </Link>
          <Link
            href="/admin/work-experience/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
          >
            <Briefcase className="size-4" />
            New Work Experience
          </Link>
        </div>
      </div>
    </div>
  );
}
