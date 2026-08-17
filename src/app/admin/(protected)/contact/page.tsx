import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { updateContact } from "@/app/admin/actions";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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

      <form action={async (formData) => { "use server"; await updateContact(formData); }}>
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent>
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
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>CV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>CV File</Label>
              <ImageUpload
                bucket="portfolio"
                path="data/cv"
                name="cv"
                currentSrc={contact?.cv ?? ""}
                accept="application/pdf"
                maxSizeMB={20}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardFooter>
            <div className="flex justify-end w-full">
              <Button type="submit">Save Contact</Button>
            </div>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
