"use client";

import Link from "next/link";
import type { CmsSaveAction } from "@/lib/cms-content";
import { CmsSaveForm, CmsSubmitButton } from "@/components/cms-save-form";
import { ChevronLeft } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type CertFormProps = {
  action: CmsSaveAction;
  hasUnsavedChanges?: boolean;
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

export function CertForm({ action, hasUnsavedChanges, initialData, submitLabel }: CertFormProps) {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/content?type=certificate" />}>
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">{submitLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">Certificate</h1>
        </div>
      </div>

      {hasUnsavedChanges && <p role="status">Unsaved changes restored. Save changes to apply them to the site.</p>}
      <CmsSaveForm action={action} successHref="/admin/content?type=certificate">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input name="title" defaultValue={initialData?.title} required />
              </div>
              <div className="space-y-2">
                <Label>Issuer</Label>
                <Input name="issuer" defaultValue={initialData?.issuer} required />
              </div>
              <div className="space-y-2">
                <Label>Issued Date</Label>
                <Input name="issued" defaultValue={initialData?.issued} required />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Input name="type" defaultValue={initialData?.type || "Certificate"} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea name="summary" defaultValue={initialData?.summary} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Details (one per line)</Label>
              <Textarea name="details" defaultValue={initialData?.details?.join("\n")} rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Relevance</Label>
              <Textarea name="relevance" defaultValue={initialData?.relevance} rows={3} />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={initialData?.featured} />
              Feature this certificate
            </label>

            <div className="space-y-2">
              <Label>Issuer Notes (one per line)</Label>
              <Textarea name="issuerNotes" defaultValue={initialData?.issuerNotes?.join("\n")} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Image</Label>
                <ImageUpload
                  bucket="portfolio"
                  path="data/certifications"
                  name="imageSrc"
                  currentSrc={initialData?.imageSrc ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Image Alt</Label>
                <Input name="imageAlt" defaultValue={initialData?.imageAlt} />
              </div>
              <div className="space-y-2">
                <Label>Width</Label>
                <Input name="imageWidth" type="number" defaultValue={initialData?.imageWidth} />
              </div>
              <div className="space-y-2">
                <Label>Height</Label>
                <Input name="imageHeight" type="number" defaultValue={initialData?.imageHeight} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardFooter className="justify-between">
            <div className="flex gap-3 ml-auto">
              <Button variant="outline" render={<Link href="/admin/content?type=certificate" />}>Cancel</Button>
              <CmsSubmitButton>{submitLabel}</CmsSubmitButton>
            </div>
          </CardFooter>
        </Card>
      </CmsSaveForm>
    </div>
  );
}
