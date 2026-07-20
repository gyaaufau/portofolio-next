import { prisma } from "@/lib/prisma";
import { DEFAULT_ACCENT } from "@/lib/theme";
import { AppearanceForm } from "./appearance-form";

export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  return (
    <div className="space-y-6">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">Theme</p>
        <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose one accent for the entire public site.</p>
      </div>
      <AppearanceForm
        initialPreset={settings?.accentPreset ?? "moss"}
        initialColor={settings?.accentColor ?? DEFAULT_ACCENT}
      />
    </div>
  );
}
