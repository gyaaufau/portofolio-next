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

  const isActive = (href: string) => pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Mobile top header */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b border-border bg-card px-4">
        <div className="flex items-baseline gap-2">
          <Link href="/admin" className="text-pixel text-[10px] text-primary font-semibold tracking-wider uppercase">
            Gialoop
          </Link>
          <span className="text-xs text-muted-foreground">Admin panel</span>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <LogOut className="size-4" />
        </button>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]" aria-label="Admin">
        <div className="grid grid-cols-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center py-2.5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-5" />
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-card border-r border-border p-4 flex-col">
        <div className="mb-6 px-2">
          <Link href="/admin" className="text-pixel text-[10px] text-primary font-semibold tracking-wider uppercase">
            Gialoop
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin panel</p>
        </div>
        <nav className="flex-1 space-y-1" aria-label="Admin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
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

      <main className="flex-1 overflow-auto pt-14 pb-20 md:pt-0 md:pb-0">
        <div className="max-w-4xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
