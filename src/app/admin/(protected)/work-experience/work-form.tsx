"use client";

import Link from "next/link";
import type { CmsSaveAction } from "@/lib/cms-content";
import { CmsSaveForm, CmsSubmitButton } from "@/components/cms-save-form";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type WorkFormProps = {
  action: CmsSaveAction;
  hasUnsavedChanges?: boolean;
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

export function WorkForm({ action, hasUnsavedChanges, initialData, submitLabel }: WorkFormProps) {

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link href="/admin/content?type=experience" />}>
          <ChevronLeft className="size-5" />
        </Button>
        <div>
          <p className="text-pixel text-[10px] text-primary tracking-wider uppercase mb-1">{submitLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">Work Experience</h1>
        </div>
      </div>

      {hasUnsavedChanges && <p role="status">Unsaved changes restored. Save changes to apply them to the site.</p>}
      <CmsSaveForm action={action} successHref="/admin/content?type=experience">
        <Card>
          <CardHeader>
            <CardTitle>Position</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Company</Label>
                <Input name="company" defaultValue={initialData?.company} required />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input name="location" defaultValue={initialData?.location} />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input name="role" defaultValue={initialData?.role} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Start</Label>
                <Input name="start" defaultValue={initialData?.start} />
              </div>
              <div className="space-y-2">
                <Label>End</Label>
                <Input name="end" defaultValue={initialData?.end} />
              </div>
              <div className="space-y-2">
                <Label>Sort Order</Label>
                <Input name="sortOrder" type="number" defaultValue={initialData?.sortOrder ?? 0} />
              </div>
              <div className="space-y-2">
                <Label>Period</Label>
                <Input name="period" defaultValue={initialData?.period} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Summary</Label>
              <Textarea name="summary" defaultValue={initialData?.summary} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Highlights (one per line)</Label>
              <Textarea name="highlights" defaultValue={initialData?.highlights?.join("\n")} rows={4} />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardFooter className="justify-between">
            <div className="flex gap-3 ml-auto">
              <Button variant="outline" render={<Link href="/admin/content?type=experience" />}>Cancel</Button>
              <CmsSubmitButton>{submitLabel}</CmsSubmitButton>
            </div>
          </CardFooter>
        </Card>
      </CmsSaveForm>
    </div>
  );
}
