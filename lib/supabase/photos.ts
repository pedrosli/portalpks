import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "property-photos";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hora

export async function getSignedPhotoUrls(
  supabase: SupabaseClient,
  paths: string[]
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.signedUrl && item.path) {
      map[item.path] = item.signedUrl;
    }
  }
  return map;
}

export function photoStoragePath(propertyId: string, fileName: string): string {
  const ext = fileName.split(".").pop() || "jpg";
  const random = Math.random().toString(36).slice(2, 10);
  return `${propertyId}/${Date.now()}-${random}.${ext}`;
}

export { BUCKET as PHOTOS_BUCKET };
