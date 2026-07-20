"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AppWindow,
  Award,
  Briefcase,
  LayoutDashboard,
  Layers,
  LogOut,
  Mail,
  Palette,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/app/admin/actions";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Apps", href: "/admin/apps", icon: AppWindow },
  { label: "Certificates", href: "/admin/certificates", icon: Award },
  { label: "Work Experience", href: "/admin/work-experience", icon: Briefcase },
  { label: "Profile", href: "/admin/profile", icon: User },
  { label: "Contact", href: "/admin/contact", icon: Mail },
  { label: "Skills", href: "/admin/skills", icon: Layers },
  { label: "Appearance", href: "/admin/appearance", icon: Palette },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="min-h-[100dvh] flex bg-background">
      <aside className="w-60 shrink-0 bg-card border-r border-border p-4 flex flex-col">
        <div className="mb-6 px-2">
          <Link href="/admin" className="text-pixel text-[10px] text-primary font-semibold tracking-wider uppercase">
            Gialoop
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin panel</p>
        </div>
        <nav className="flex-1 space-y-1" aria-label="Admin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors mt-auto">
          <LogOut className="size-4" /> Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
