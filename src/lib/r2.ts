import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { readFileSync } from "fs";
import { posix } from "path";

const R2_ENDPOINT = process.env.R2_ENDPOINT;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".json": "application/json",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
};

function guessMime(filePath: string): string {
  const ext = posix.extname(filePath).toLowerCase();
  return MIME_MAP[ext] || "application/octet-stream";
}

export function r2Url(path: string): string {
  if (!R2_PUBLIC_URL) return path;
  const key = path.startsWith("/") ? path.slice(1) : path;
  return `${R2_PUBLIC_URL}/${key}`;
}

export function isR2Configured(): boolean {
  return Boolean(R2_ENDPOINT && R2_BUCKET && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

export function createR2Client(): S3Client {
  if (!isR2Configured()) throw new Error("R2 environment variables are not configured.");
  return new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT!,
    credentials: { accessKeyId: R2_ACCESS_KEY_ID!, secretAccessKey: R2_SECRET_ACCESS_KEY! },
  });
}

export async function uploadToR2(localPath: string, key: string, client?: S3Client): Promise<void> {
  const s3 = client ?? createR2Client();
  const body = readFileSync(localPath);
  await s3.send(new PutObjectCommand({ Bucket: R2_BUCKET, Key: key, Body: body, ContentType: guessMime(localPath) }));
}

export async function listR2Keys(client?: S3Client): Promise<Set<string>> {
  const s3 = client ?? createR2Client();
  const keys = new Set<string>();
  let continuation: string | undefined;
  do {
    const res = await s3.send(new ListObjectsV2Command({ Bucket: R2_BUCKET, ContinuationToken: continuation }));
    res.Contents?.forEach((obj) => { if (obj.Key) keys.add(obj.Key); });
    continuation = res.NextContinuationToken;
  } while (continuation);
  return keys;
}

export function r2KeyFromPublicPath(publicPath: string, publicDir: string): string {
  const relative = publicPath.replace(publicDir, "");
  return posix.normalize(relative.startsWith("/") ? relative.slice(1) : relative);
}
