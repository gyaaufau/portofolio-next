import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { deleteCertificate } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AdminCertificatesPage() {
  const supabase = createClient(await cookies());
  const { data: certificates } = await supabase
    .from("certificate")
    .select("id, title, issuer, issued, featured, image_src")
    .order("issued", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">manage</p>
          <h1 className="text-2xl font-bold tracking-tight">Certificates</h1>
        </div>
        <Button render={<Link href="/admin/certificates/new" />}>
          <Plus className="size-4" />
          New Certificate
        </Button>
      </div>

      <div className="space-y-2">
        {(certificates ?? []).map((cert) => (
          <Card key={cert.id}>
            <CardContent className="flex items-center gap-4 p-4">
              {cert.image_src && (
                <Image
                  src={cert.image_src}
                  alt={`${cert.title} certificate`}
                  width={40}
                  height={40}
                  className="rounded-lg size-10 object-cover border border-border shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <h3 className="font-medium text-foreground truncate">{cert.title}</h3>
                <p className="text-xs text-muted-foreground">{cert.issuer} &middot; {cert.issued}</p>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" render={<Link href={`/admin/certificates/${cert.id}/edit`} />}>
                  <Pencil className="size-4" />
                </Button>
                <form action={async () => { "use server"; await deleteCertificate(cert.id); }}>
                  <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="size-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
        {(!certificates || certificates.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No certificates yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
