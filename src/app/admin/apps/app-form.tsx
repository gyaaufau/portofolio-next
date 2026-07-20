"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type AppFormProps = {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    title?: string;
    tagline?: string;
    description?: string;
    appType?: string;
    workType?: string;
    period?: string;
    periodShort?: string;
    sortOrder?: number;
    featured?: boolean;
    appStoreUrl?: string;
    playStoreUrl?: string;
    websiteUrl?: string;
    githubUrl?: string;
    otherUrl?: string;
    otherUrlLabel?: string;
    appIconSrc?: string;
    appIconAlt?: string;
    thumbnailSrc?: string;
    thumbnailAlt?: string;
    stack?: string[];
    highlights?: string[];
    sections?: unknown;
  };
  submitLabel: string;
};

export function AppForm({ action, initialData, submitLabel }: AppFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (_: { error?: string } | null, formData: FormData) => {
      try {
        await action(formData);
        router.push("/admin/apps");
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
        <Link
          href="/admin/apps"
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">{submitLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">App</h1>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input name="title" defaultValue={initialData?.title} required className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tagline</label>
            <input name="tagline" defaultValue={initialData?.tagline} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Description</label>
          <textarea name="description" defaultValue={initialData?.description} rows={4} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">App Type</label>
            <select name="appType" defaultValue={initialData?.appType || "mobile"} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="web">Web</option>
              <option value="backend">Backend</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Work Type</label>
            <select name="workType" defaultValue={initialData?.workType || "personal"} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary">
              <option value="personal">Personal</option>
              <option value="work">Work</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sort Order</label>
            <input name="sortOrder" type="number" defaultValue={initialData?.sortOrder ?? 0} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Period</label>
            <input name="period" defaultValue={initialData?.period} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Period Short</label>
            <input name="periodShort" defaultValue={initialData?.periodShort} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" name="featured" id="featured" defaultChecked={initialData?.featured} className="size-4 rounded border-border accent-primary" />
          <label htmlFor="featured" className="text-sm font-medium text-foreground">Featured</label>
        </div>

        <div className="divider-pixel" />

        <h2 className="text-lg font-semibold">Media</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">App Icon Path</label>
            <input name="appIconSrc" defaultValue={initialData?.appIconSrc} placeholder="/data/apps/my-app/icon.png" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">App Icon Alt</label>
            <input name="appIconAlt" defaultValue={initialData?.appIconAlt} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Thumbnail Path</label>
            <input name="thumbnailSrc" defaultValue={initialData?.thumbnailSrc} placeholder="/data/apps/my-app/thumb.png" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Thumbnail Alt</label>
            <input name="thumbnailAlt" defaultValue={initialData?.thumbnailAlt} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div className="divider-pixel" />

        <h2 className="text-lg font-semibold">Store Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">App Store URL</label>
            <input name="appStoreUrl" defaultValue={initialData?.appStoreUrl} placeholder="https://apps.apple.com/..." className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Play Store URL</label>
            <input name="playStoreUrl" defaultValue={initialData?.playStoreUrl} placeholder="https://play.google.com/store/..." className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Website URL</label>
            <input name="websiteUrl" defaultValue={initialData?.websiteUrl} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">GitHub URL</label>
            <input name="githubUrl" defaultValue={initialData?.githubUrl} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Other URL</label>
            <input name="otherUrl" defaultValue={initialData?.otherUrl} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Other URL Label</label>
            <input name="otherUrlLabel" defaultValue={initialData?.otherUrlLabel} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
          </div>
        </div>

        <div className="divider-pixel" />

        <h2 className="text-lg font-semibold">Content</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tech Stack (comma separated)</label>
          <input name="stack" defaultValue={initialData?.stack?.join(", ")} placeholder="Flutter, Dart, BLoC" className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Highlights (one per line)</label>
          <textarea name="highlights" defaultValue={initialData?.highlights?.join("\n")} rows={5} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Sections (JSON)</label>
          <p className="text-xs text-muted-foreground">Nested sections with paragraphs, bullets, code blocks. Leave empty for none.</p>
          <textarea name="sections" defaultValue={initialData?.sections ? JSON.stringify(initialData.sections, null, 2) : "[]"} rows={8} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-y" />
        </div>

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/apps"
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {pending ? "Saving..." : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
