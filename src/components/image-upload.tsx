"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Upload, X, Loader2, File } from "lucide-react";

type ImageUploadProps = {
  bucket: string;
  path: string;
  name: string;
  currentSrc?: string;
  accept?: string;
  maxSizeMB?: number;
};

function isImageAccept(accept: string): boolean {
  return accept.includes("image");
}

function fileNameFromUrl(url: string): string {
  try {
    const parts = url.split("/");
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
}

export function ImageUpload({
  bucket,
  path,
  name,
  currentSrc = "",
  accept = "image/webp,image/png,image/jpeg,image/jpg,image/gif,image/svg+xml",
  maxSizeMB = 10,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage = isImageAccept(accept);
  const [preview, setPreview] = useState(currentSrc);
  const [fileName, setFileName] = useState<string | null>(
    currentSrc && !isImage ? fileNameFromUrl(currentSrc) : null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storagePath, setStoragePath] = useState(currentSrc);

  async function handleFile(file: File) {
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "webp";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${path.replace(/\/$/, "")}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setPreview(publicUrl);
      setStoragePath(publicUrl);
      if (!isImage) setFileName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    setPreview("");
    setStoragePath("");
    setFileName(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={storagePath} />

      {storagePath ? (
        <div className="relative group w-fit">
          {isImage ? (
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-24 rounded-lg border border-border object-cover"
            />
          ) : (
            <div className="h-16 w-48 rounded-lg border border-border bg-card flex items-center gap-2 px-3">
              <File className="size-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-foreground truncate">{fileName || fileNameFromUrl(storagePath)}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleClear}
            className="absolute -top-2 -right-2 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="size-3" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="h-24 w-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary/50 transition-colors text-muted-foreground"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <Upload className="size-4" />
              <span className="text-[10px]">Upload</span>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
