import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { updateContact } from "@/app/admin/actions";
import { ImageUpload } from "@/components/image-upload";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const supabase = createClient(await cookies());
  const { data: contact } = await supabase.from("contact").select("*").limit(1).single();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">edit</p>
        <h1 className="text-2xl font-bold tracking-tight">Contact</h1>
      </div>

      <form action={async (formData) => { "use server"; await updateContact(formData); }} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input name="email" type="email" defaultValue={contact?.email} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">WhatsApp</label>
            <input name="whatsapp" defaultValue={contact?.whatsapp} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">GitHub</label>
            <input name="github" defaultValue={contact?.github} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">LinkedIn</label>
            <input name="linkedin" defaultValue={contact?.linkedin} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Play Store</label>
            <input name="playStore" defaultValue={contact?.play_store} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Play Console</label>
            <input name="playConsole" defaultValue={contact?.play_console} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">CV</label>
            <ImageUpload
              bucket="portfolio"
              path="data/cv"
              name="cv"
              currentSrc={contact?.cv ?? ""}
              accept="application/pdf"
              maxSizeMB={20}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            Save Contact
          </button>
        </div>
      </form>
    </div>
  );
}
