import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { DEFAULT_ACCENT } from "@/lib/theme";
import { AppearanceForm } from "./appearance-form";

export const dynamic = "force-dynamic";

export default async function AppearancePage() {
  const supabase = createClient(await cookies());
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", "site").single();
  return (
    <div className="space-y-6">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">Theme</p>
        <h1 className="text-2xl font-bold tracking-tight">Appearance</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose one accent for the entire public site.</p>
      </div>
      <AppearanceForm
        initialPreset={settings?.accent_preset ?? "moss"}
        initialColor={settings?.accent_color ?? DEFAULT_ACCENT}
      />
    </div>
  );
}
