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
import { logout } from "@/app/admin/actions";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  return (
    <SidebarProvider defaultOpen>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>
          <div className="px-2 py-2">
            <Link
              href="/admin"
              className="text-pixel text-[10px] text-primary font-semibold tracking-wider uppercase"
            >
              Gialoop
            </Link>
            <p className="text-xs text-muted-foreground mt-1">Admin panel</p>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />} isActive={active}>
                      <Icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton render={<button onClick={handleLogout} className="w-full" />}>
                <LogOut className="size-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <div className="flex items-baseline gap-2">
            <Link
              href="/admin"
              className="text-pixel text-[10px] text-primary font-semibold tracking-wider uppercase"
            >
              Gialoop
            </Link>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Admin panel
            </span>
          </div>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto p-4 md:p-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
