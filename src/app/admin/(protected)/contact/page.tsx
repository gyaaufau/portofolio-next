import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { updateContact } from "@/app/admin/actions";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue={contact?.email} required />
          </div>
          <div className="space-y-2">
            <Label>WhatsApp</Label>
            <Input name="whatsapp" defaultValue={contact?.whatsapp} />
          </div>
          <div className="space-y-2">
            <Label>GitHub</Label>
            <Input name="github" defaultValue={contact?.github} />
          </div>
          <div className="space-y-2">
            <Label>LinkedIn</Label>
            <Input name="linkedin" defaultValue={contact?.linkedin} />
          </div>
          <div className="space-y-2">
            <Label>Play Store</Label>
            <Input name="playStore" defaultValue={contact?.play_store} />
          </div>
          <div className="space-y-2">
            <Label>Play Console</Label>
            <Input name="playConsole" defaultValue={contact?.play_console} />
          </div>
          <div className="space-y-2">
            <Label>CV</Label>
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
          <Button type="submit">Save Contact</Button>
        </div>
      </form>
    </div>
  );
}
