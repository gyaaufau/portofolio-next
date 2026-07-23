const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export function storageUrl(path: string): string {
  if (!SUPABASE_URL) return path;
  const key = path.startsWith("/") ? path.slice(1) : path;
  return `${SUPABASE_URL}/storage/v1/object/public/portfolio/${key}`;
}

export function appStorageUrl(slug: string, path: string): string {
  if (!SUPABASE_URL) return path;
  const key = path.startsWith("/") ? path.slice(1) : path;
  return `${SUPABASE_URL}/storage/v1/object/public/apps/${slug}/${key}`;
}
