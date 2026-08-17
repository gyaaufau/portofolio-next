import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { updateProfile } from "@/app/admin/actions";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

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
            <Label>Name</Label>
            <Input name="name" defaultValue={profile?.name} required />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input name="role" defaultValue={profile?.role} required />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input name="location" defaultValue={profile?.location} />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Checkbox name="openToOpportunities" id="open" defaultChecked={profile?.open_to_opportunities} />
            <Label htmlFor="open">Open to opportunities</Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Intro</Label>
          <Textarea name="intro" defaultValue={profile?.intro} rows={3} />
        </div>

        <div className="divider-pixel" />

        <h2 className="text-lg font-semibold">Photo</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Photo</Label>
            <ImageUpload
              bucket="portfolio"
              path="data/myself"
              name="photoSrc"
              currentSrc={profile?.photo_src ?? ""}
              accept="image/webp,image/png,image/jpeg"
            />
          </div>
          <div className="space-y-2">
            <Label>Photo Alt</Label>
            <Input name="photoAlt" defaultValue={profile?.photo_alt} />
          </div>
          <div className="space-y-2">
            <Label>Width</Label>
            <Input name="photoWidth" type="number" defaultValue={profile?.photo_width ?? 400} />
          </div>
          <div className="space-y-2">
            <Label>Height</Label>
            <Input name="photoHeight" type="number" defaultValue={profile?.photo_height ?? 500} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit">Save Profile</Button>
        </div>
      </form>
    </div>
  );
}
