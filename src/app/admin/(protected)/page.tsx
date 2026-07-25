import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { AppWindow, Award, Briefcase, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createClient(await cookies());

  const [appRes, certRes, workRes, featuredRes] = await Promise.all([
    supabase.from("app").select("*", { count: "exact", head: true }),
    supabase.from("certificate").select("*", { count: "exact", head: true }),
    supabase.from("work_experience").select("*", { count: "exact", head: true }),
    supabase.from("app").select("*", { count: "exact", head: true }).eq("featured", true),
  ]);

  const stats = [
    { label: "Apps", value: appRes.count ?? 0, icon: AppWindow, href: "/admin/apps" },
    { label: "Certificates", value: certRes.count ?? 0, icon: Award, href: "/admin/certificates" },
    { label: "Work Experience", value: workRes.count ?? 0, icon: Briefcase, href: "/admin/work-experience" },
    { label: "Featured Apps", value: featuredRes.count ?? 0, icon: Star, href: "/admin/apps" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">overview</p>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
