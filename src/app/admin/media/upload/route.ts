import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { validateMediaUpload } from "@/lib/cms-media";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!await verifySessionToken(session)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const bucket = form.get("bucket") === "apps" ? "apps" : "portfolio";
  if (!(file instanceof File)) return Response.json({ error: "Choose a PNG, JPG, or WEBP image." }, { status: 400 });
  const validation = validateMediaUpload(file.type,file.size);
  if (validation) return Response.json({ error:validation }, { status: validation.includes("10 MB") ? 413 : 400 });
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const storagePath = `cms/${randomUUID()}.${extension}`;
  const db = createAdminClient();
  const uploaded = await db.storage.from(bucket).upload(storagePath, Buffer.from(await file.arrayBuffer()), { contentType:file.type, upsert:false });
  if (uploaded.error) return Response.json({ error: uploaded.error.message }, { status: 500 });
  const publicUrl = db.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;
  const saved = await db.from("cms_media").insert({ bucket, storage_path:storagePath, public_url:publicUrl, file_name:file.name, mime_type:file.type, size_bytes:file.size });
  if (saved.error) {
    await db.storage.from(bucket).remove([storagePath]);
    return Response.json({ error:saved.error.message }, { status:500 });
  }
  return Response.json({ publicUrl, fileName:file.name });
}
