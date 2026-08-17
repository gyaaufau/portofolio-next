"use client";

import { useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Upload, X, Loader2, GripVertical } from "lucide-react";

type Screenshot = {
  id?: string;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  order: number;
};

type ScreenshotUploadProps = {
  bucket: string;
  path: string;
  initialScreenshots?: Screenshot[];
  maxSizeMB?: number;
};

export function ScreenshotUpload({
  bucket,
  path,
  initialScreenshots = [],
  maxSizeMB = 10,
}: ScreenshotUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [screenshots, setScreenshots] = useState<Screenshot[]>(initialScreenshots);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);

    try {
      const supabase = createClient();
      const newScreenshots: Screenshot[] = [];

      for (const file of Array.from(files)) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File ${file.name} too large. Max ${maxSizeMB}MB.`);
          continue;
        }

        const ext = file.name.split(".").pop() || "webp";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const filePath = `${path.replace(/\/$/, "")}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          setError(uploadError.message);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(filePath);

        newScreenshots.push({
          src: publicUrl,
          alt: file.name.replace(/\.[^.]+$/, ""),
          order: screenshots.length + newScreenshots.length,
        });
      }

      if (newScreenshots.length > 0) {
        setScreenshots((prev) => [...prev, ...newScreenshots]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleRemove(index: number) {
    setScreenshots((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, order: i }))
    );
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    setScreenshots((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated.map((s, i) => ({ ...s, order: i }));
    });
    setDragIndex(index);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  return (
    <div className="space-y-3">
      {/* Hidden inputs for form submission */}
      {screenshots.map((s, i) => (
        <div key={i}>
          <input type="hidden" name={`screenshotSrc_${i}`} value={s.src} />
          <input type="hidden" name={`screenshotAlt_${i}`} value={s.alt} />
          <input type="hidden" name={`screenshotOrder_${i}`} value={s.order} />
          {s.id && <input type="hidden" name={`screenshotId_${i}`} value={s.id} />}
        </div>
      ))}
      <input type="hidden" name="screenshotCount" value={screenshots.length} />

      {/* Screenshot grid */}
      {screenshots.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {screenshots.map((s, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDragEnd={handleDragEnd}
              className={`relative group rounded-lg border border-border overflow-hidden cursor-move ${
                dragIndex === i ? "ring-2 ring-primary" : ""
              }`}
            >
              <img
                src={s.src}
                alt={s.alt}
                className="w-full h-24 object-cover"
              />
              <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="size-4 text-white drop-shadow" />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1 right-1 size-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="size-3" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 py-0.5 truncate">
                {s.alt}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors text-muted-foreground"
      >
        {uploading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <>
            <Upload className="size-4" />
            <span className="text-sm">Add screenshots</span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/webp,image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
