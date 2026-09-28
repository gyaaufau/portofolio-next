"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { validateMediaUpload } from "@/lib/cms-media";

type UploadState = { name: string; progress: number; error?: string };
export function MediaUploader() {
  const input = useRef<HTMLInputElement>(null);
  const retryFile = useRef<File | null>(null);
  const router = useRouter();
  const [upload, setUpload] = useState<UploadState | null>(null);
  function send(file: File) {
    retryFile.current = file;
    const validation = validateMediaUpload(file.type,file.size);
    if (validation) { setUpload({ name:file.name, progress:0, error:validation }); return; }
    const xhr = new XMLHttpRequest();
    const data = new FormData();
    data.append("file",file);
    data.append("bucket","portfolio");
    setUpload({ name:file.name, progress:0 });
    xhr.upload.onprogress = (event) => { if (event.lengthComputable) setUpload({ name:file.name, progress:Math.round(event.loaded / event.total * 100) }); };
    xhr.onerror = () => setUpload({ name:file.name, progress:0, error:"Upload failed. Try again." });
    xhr.onload = () => { if (xhr.status >= 200 && xhr.status < 300) { setUpload(null); router.refresh(); } else { let message = "Upload failed. Try again."; try { message = JSON.parse(xhr.responseText).error || message; } catch {} setUpload({ name:file.name, progress:0, error:message }); } };
    xhr.open("POST","/admin/media/upload");
    xhr.send(data);
  }
  return <div className="cms-media-uploader"><input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => { const file = event.target.files?.[0]; if (file) send(file); event.target.value = ""; }} /><button type="button" className="cms-button cms-button-primary" onClick={() => input.current?.click()}>+ Upload image</button>{upload && <div className={`cms-upload-state${upload.error ? " is-error" : ""}`} role="status"><strong>{upload.name}</strong><span>{upload.error ? upload.error : `${upload.progress}%`}</span>{!upload.error && <progress value={upload.progress} max="100" />}{upload.error && <button type="button" onClick={() => retryFile.current && send(retryFile.current)}>Retry</button>}</div>}</div>;
}
