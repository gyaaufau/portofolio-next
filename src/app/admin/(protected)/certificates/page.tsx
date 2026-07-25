import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, Pencil } from "lucide-react";
import { deleteCertificate } from "@/app/admin/actions";

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
        <Link href="/admin/certificates/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="size-4" /> New Certificate
        </Link>
      </div>

      <div className="space-y-2">
        {(certificates ?? []).map((cert) => (
          <div key={cert.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border">
            {cert.image_src && <Image src={cert.image_src} alt={`${cert.title} certificate`} width={40} height={40} className="rounded-lg size-10 object-cover border border-border shrink-0" />}
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-foreground truncate">{cert.title}</h3>
              <p className="text-xs text-muted-foreground">{cert.issuer} &middot; {cert.issued}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/admin/certificates/${cert.id}/edit`} className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <Pencil className="size-4" />
              </Link>
              <form action={async () => { "use server"; await deleteCertificate(cert.id); }}>
                <button type="submit" className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
                  <Trash2 className="size-4" />
                </button>
              </form>
            </div>
          </div>
        ))}
        {(!certificates || certificates.length === 0) && <div className="text-center py-12 text-muted-foreground"><p>No certificates yet.</p></div>}
      </div>
    </div>
  );
}
