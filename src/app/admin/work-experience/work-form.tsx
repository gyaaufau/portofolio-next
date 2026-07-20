"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type WorkFormProps = {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    company?: string;
    location?: string;
    role?: string;
    start?: string;
    end?: string;
    period?: string;
    sortOrder?: number;
    summary?: string;
    highlights?: string[];
  };
  submitLabel: string;
};

export function WorkForm({ action, initialData, submitLabel }: WorkFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_: { error?: string } | null, formData: FormData) => {
      try {
        await action(formData);
        router.push("/admin/work-experience");
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
        <Link href="/admin/work-experience" className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">{submitLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">Work Experience</h1>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Company</label>
            <input name="company" defaultValue={initialData?.company} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Location</label>
            <input name="location" defaultValue={initialData?.location} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Role</label>
            <input name="role" defaultValue={initialData?.role} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Period</label>
            <input name="period" defaultValue={initialData?.period} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Start</label>
            <input name="start" defaultValue={initialData?.start} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">End</label>
            <input name="end" defaultValue={initialData?.end} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sort Order</label>
            <input name="sortOrder" type="number" defaultValue={initialData?.sortOrder ?? 0} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Summary</label>
          <textarea name="summary" defaultValue={initialData?.summary} rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Highlights (one per line)</label>
          <textarea name="highlights" defaultValue={initialData?.highlights?.join("\n")} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

        <div className="flex justify-end gap-3">
          <Link href="/admin/work-experience" className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors">Cancel</Link>
          <button type="submit" disabled={pending} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {pending ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
