import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { AppWindow, Award, Briefcase, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:border-primary/30 transition-colors group">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href="/admin/apps/new" />}>
            <AppWindow className="size-4" />
            New App
          </Button>
          <Button variant="outline" render={<Link href="/admin/certificates/new" />}>
            <Award className="size-4" />
            New Certificate
          </Button>
          <Button variant="outline" render={<Link href="/admin/work-experience/new" />}>
            <Briefcase className="size-4" />
            New Work Experience
          </Button>
        </div>
      </div>
    </div>
  );
}
