import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { updateProfile } from "@/app/admin/actions";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

      <form action={async (formData) => { "use server"; await updateProfile(formData); }}>
        <Card>
          <CardHeader>
            <CardTitle>Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
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
                <Label>Hero Pretitle</Label>
                <Input name="heroPretitle" defaultValue={profile?.hero_pretitle} />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <Checkbox name="availableForWork" id="availableForWork" defaultChecked={profile?.available_for_work} />
                <Label htmlFor="availableForWork">Available for work</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea name="bio" defaultValue={profile?.bio} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Photo</CardTitle>
          </CardHeader>
          <CardContent>
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
                <Label>Photo Width</Label>
                <Input name="photoWidth" type="number" defaultValue={profile?.photo_width ?? 400} />
              </div>
              <div className="space-y-2">
                <Label>Photo Height</Label>
                <Input name="photoHeight" type="number" defaultValue={profile?.photo_height ?? 500} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardFooter>
            <div className="flex justify-end w-full">
              <Button type="submit">Save Profile</Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
