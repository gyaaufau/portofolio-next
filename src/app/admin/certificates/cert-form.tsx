"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type CertFormProps = {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    title?: string;
    issuer?: string;
    issued?: string;
    type?: string;
    summary?: string;
    details?: string[];
    relevance?: string;
    issuerNotes?: string[];
    featured?: boolean;
    imageSrc?: string;
    imageAlt?: string;
    imageWidth?: number;
    imageHeight?: number;
  };
  submitLabel: string;
};

export function CertForm({ action, initialData, submitLabel }: CertFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_: { error?: string } | null, formData: FormData) => {
      try {
        await action(formData);
        router.push("/admin/certificates");
        router.refresh();
        return null;
      } catch (e) {
        return { error: e instanceof Error ? e.message : "Something went wrong" };
      }
    },
    null
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/certificates" className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">{submitLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">Certificate</h1>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input name="title" defaultValue={initialData?.title} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Issuer</label>
            <input name="issuer" defaultValue={initialData?.issuer} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Issued Date</label>
            <input name="issued" defaultValue={initialData?.issued} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <input name="type" defaultValue={initialData?.type || "Certificate"} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" name="featured" id="featured" defaultChecked={initialData?.featured} className="size-4 rounded border-border accent-primary" />
          <label htmlFor="featured" className="text-sm font-medium text-foreground">Featured</label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Summary</label>
          <textarea name="summary" defaultValue={initialData?.summary} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Details (one per line)</label>
          <textarea name="details" defaultValue={initialData?.details?.join("\n")} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Relevance</label>
          <textarea name="relevance" defaultValue={initialData?.relevance} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Issuer Notes (one per line)</label>
          <textarea name="issuerNotes" defaultValue={initialData?.issuerNotes?.join("\n")} rows={2} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        <div className="divider-pixel" />
        <h2 className="text-lg font-semibold">Image</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Image Path</label>
            <input name="imageSrc" defaultValue={initialData?.imageSrc} placeholder="/data/certifications/my-cert/certificate.jpg" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Image Alt</label>
            <input name="imageAlt" defaultValue={initialData?.imageAlt} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Width</label>
            <input name="imageWidth" type="number" defaultValue={initialData?.imageWidth} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Height</label>
            <input name="imageHeight" type="number" defaultValue={initialData?.imageHeight} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/admin/certificates" className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</Link>
          <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {pending ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
