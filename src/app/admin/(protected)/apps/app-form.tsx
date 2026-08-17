"use client";

import { useActionState, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { ScreenshotUpload } from "@/components/screenshot-upload";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    slug?: string;
    hasPrivacyPolicy?: boolean;
    privacyPolicyContent?: string;
    hasAccountDeletion?: boolean;
    accountDeletionContent?: string;
    accountDeletionRequiresAuth?: boolean;
  };
  submitLabel: string;
  showScreenshots?: boolean;
};

export function AppForm({ action, initialData, submitLabel, showScreenshots }: AppFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [appType, setAppType] = useState(initialData?.appType ?? "mobile");
  const [hasPrivacyPolicy, setHasPrivacyPolicy] = useState(initialData?.hasPrivacyPolicy ?? false);
  const [hasAccountDeletion, setHasAccountDeletion] = useState(initialData?.hasAccountDeletion ?? false);
  const [accountDeletionRequiresAuth, setAccountDeletionRequiresAuth] = useState(initialData?.accountDeletionRequiresAuth ?? false);
  const slug = useMemo(() => {
    if (initialData?.slug) return initialData.slug;
    return title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "temp";
  }, [title, initialData?.slug]);
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
        <Button variant="ghost" size="icon" render={<Link href="/admin/apps" />}>
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">{submitLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">App</h1>
        </div>
      </div>

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input name="title" defaultValue={initialData?.title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Tagline</Label>
            <Input name="tagline" defaultValue={initialData?.tagline} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea name="description" defaultValue={initialData?.description} rows={4} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>App Type</Label>
            <Select name="appType" value={appType} onValueChange={(v) => setAppType(v ?? "mobile")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mobile">Mobile</SelectItem>
                <SelectItem value="desktop">Desktop</SelectItem>
                <SelectItem value="web">Web</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
              </SelectContent>
            </Select>
            <input type="hidden" name="appType" value={appType} />
          </div>
          <div className="space-y-2">
            <Label>Work Type</Label>
            <Select name="workType" defaultValue={initialData?.workType || "personal"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="work">Work</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Input name="sortOrder" type="number" defaultValue={initialData?.sortOrder ?? 0} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Period</Label>
            <Input name="period" defaultValue={initialData?.period} />
          </div>
          <div className="space-y-2">
            <Label>Period Short</Label>
            <Input name="periodShort" defaultValue={initialData?.periodShort} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Checkbox name="featured" id="featured" defaultChecked={initialData?.featured} />
          <Label htmlFor="featured">Featured</Label>
        </div>

        <div className="divider-pixel" />

        <h2 className="text-lg font-semibold">Media</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>App Icon</Label>
            <ImageUpload
              bucket="apps"
              path={`${slug}/logo`}
              name="appIconSrc"
              currentSrc={initialData?.appIconSrc ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>App Icon Alt</Label>
            <Input name="appIconAlt" defaultValue={initialData?.appIconAlt} />
          </div>
          <div className="space-y-2">
            <Label>Thumbnail</Label>
            <ImageUpload
              bucket="apps"
              path={slug}
              name="thumbnailSrc"
              currentSrc={initialData?.thumbnailSrc ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Thumbnail Alt</Label>
            <Input name="thumbnailAlt" defaultValue={initialData?.thumbnailAlt} />
          </div>
        </div>

        {showScreenshots && (
          <>
            <div className="divider-pixel" />
            <h2 className="text-lg font-semibold">Screenshots</h2>
            <p className="text-sm text-muted-foreground">Optional. Drag to reorder. Images upload directly to storage.</p>
            <ScreenshotUpload
              bucket="apps"
              path={`${slug}/screenshots`}
              initialScreenshots={[]}
            />
          </>
        )}

        <div className="divider-pixel" />

        <h2 className="text-lg font-semibold">Store Links</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>App Store URL</Label>
            <Input name="appStoreUrl" defaultValue={initialData?.appStoreUrl} placeholder="https://apps.apple.com/..." />
          </div>
          <div className="space-y-2">
            <Label>Play Store URL</Label>
            <Input name="playStoreUrl" defaultValue={initialData?.playStoreUrl} placeholder="https://play.google.com/store/..." />
          </div>
          <div className="space-y-2">
            <Label>Website URL</Label>
            <Input name="websiteUrl" defaultValue={initialData?.websiteUrl} />
          </div>
          <div className="space-y-2">
            <Label>GitHub URL</Label>
            <Input name="githubUrl" defaultValue={initialData?.githubUrl} />
          </div>
          <div className="space-y-2">
            <Label>Other URL</Label>
            <Input name="otherUrl" defaultValue={initialData?.otherUrl} />
          </div>
          <div className="space-y-2">
            <Label>Other URL Label</Label>
            <Input name="otherUrlLabel" defaultValue={initialData?.otherUrlLabel} />
          </div>
        </div>

        <div className="divider-pixel" />

        <h2 className="text-lg font-semibold">Content</h2>

        <div className="space-y-2">
          <Label>Tech Stack (comma separated)</Label>
          <Input name="stack" defaultValue={initialData?.stack?.join(", ")} placeholder="Flutter, Dart, BLoC" />
        </div>

        <div className="space-y-2">
          <Label>Highlights (one per line)</Label>
          <Textarea name="highlights" defaultValue={initialData?.highlights?.join("\n")} rows={5} />
        </div>

        <div className="space-y-2">
          <Label>Sections (JSON)</Label>
          <p className="text-xs text-muted-foreground">Nested sections with paragraphs, bullets, code blocks. Leave empty for none.</p>
          <Textarea name="sections" defaultValue={initialData?.sections ? JSON.stringify(initialData.sections, null, 2) : "[]"} rows={8} className="font-mono" />
        </div>

        {appType === "mobile" && (
          <>
            <div className="divider-pixel" />

            <h2 className="text-lg font-semibold">Legal Pages</h2>
            <p className="text-sm text-muted-foreground">Optional pages for App Store / Play Store compliance.</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  name="hasPrivacyPolicy"
                  id="hasPrivacyPolicy"
                  checked={hasPrivacyPolicy}
                  onCheckedChange={(checked) => setHasPrivacyPolicy(checked === true)}
                />
                <Label htmlFor="hasPrivacyPolicy">Enable Privacy Policy Page</Label>
              </div>
              {hasPrivacyPolicy && (
                <div className="space-y-2">
                  <Label>Privacy Policy Content</Label>
                  <RichTextEditor
                    name="privacyPolicyContent"
                    defaultValue={initialData?.privacyPolicyContent ?? ""}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  name="hasAccountDeletion"
                  id="hasAccountDeletion"
                  checked={hasAccountDeletion}
                  onCheckedChange={(checked) => setHasAccountDeletion(checked === true)}
                />
                <Label htmlFor="hasAccountDeletion">Enable Account Deletion Page</Label>
              </div>
              {hasAccountDeletion && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Account Deletion Content</Label>
                    <RichTextEditor
                      name="accountDeletionContent"
                      defaultValue={initialData?.accountDeletionContent ?? ""}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      name="accountDeletionRequiresAuth"
                      id="accountDeletionRequiresAuth"
                      checked={accountDeletionRequiresAuth}
                      onCheckedChange={(checked) => setAccountDeletionRequiresAuth(checked === true)}
                    />
                    <Label htmlFor="accountDeletionRequiresAuth">Requires Authentication</Label>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {state?.error && (
          <p className="text-sm text-destructive">{state.error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" render={<Link href="/admin/apps" />}>Cancel</Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
