import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { updateProfile } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const supabase = createClient(await cookies());
  const { data: profile } = await supabase.from("profile").select("*").limit(1).single();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">edit</p>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
      </div>

      <form action={async (formData) => { "use server"; await updateProfile(formData); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Name</label>
            <input name="name" defaultValue={profile?.name} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <input name="role" defaultValue={profile?.role} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location</label>
            <input name="location" defaultValue={profile?.location} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input type="checkbox" name="openToOpportunities" id="open" defaultChecked={profile?.open_to_opportunities} className="size-4 rounded border-border accent-primary" />
            <label htmlFor="open" className="text-sm font-medium text-foreground">Open to opportunities</label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Intro</label>
          <textarea name="intro" defaultValue={profile?.intro} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        <div className="divider-pixel" />
        <h2 className="text-lg font-semibold">Photo</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Photo Path</label>
            <input name="photoSrc" defaultValue={profile?.photo_src} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Photo Alt</label>
            <input name="photoAlt" defaultValue={profile?.photo_alt} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Width</label>
            <input name="photoWidth" type="number" defaultValue={profile?.photo_width ?? 400} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Height</label>
            <input name="photoHeight" type="number" defaultValue={profile?.photo_height ?? 500} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}
