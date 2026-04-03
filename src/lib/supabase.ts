import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const commentMediaBucket =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?.trim() || "comment-media";
const normalizedSupabaseUrl = supabaseUrl?.trim().replace(/\/+$/, "") || "";
const encodedSupabaseBucket = encodeURIComponent(commentMediaBucket);
const supabasePublicObjectBaseUrl = normalizedSupabaseUrl
  ? `${normalizedSupabaseUrl}/storage/v1/object/public/${encodedSupabaseBucket}`
  : "";
const supabaseRenderedImageBaseUrl = normalizedSupabaseUrl
  ? `${normalizedSupabaseUrl}/storage/v1/render/image/public/${encodedSupabaseBucket}`
  : "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseCommentMediaBucket = commentMediaBucket;

export const supabase =
  isSupabaseConfigured && supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

const normalizeStorageObjectPath = (objectPath: string | null | undefined) =>
  typeof objectPath === "string" ? objectPath.trim().replace(/^\/+/, "") : "";
const encodeStorageObjectPath = (normalizedPath: string) =>
  normalizedPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

export function getSupabasePublicObjectUrl(objectPath: string | null | undefined) {
  const normalizedPath = normalizeStorageObjectPath(objectPath);

  if (!normalizedPath) {
    return null;
  }

  const encodedPath = encodeStorageObjectPath(normalizedPath);

  if (supabasePublicObjectBaseUrl) {
    return `${supabasePublicObjectBaseUrl}/${encodedPath}`;
  }

  if (!supabase) {
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(supabaseCommentMediaBucket).getPublicUrl(normalizedPath);

  return publicUrl || null;
}

export function getSupabaseRenderedImageUrl(
  objectPath: string | null | undefined,
  options?: {
    width?: number;
    height?: number;
    quality?: number;
    resize?: "contain" | "cover" | "fill";
  }
) {
  const normalizedPath = normalizeStorageObjectPath(objectPath);

  if (!normalizedPath || !supabaseRenderedImageBaseUrl) {
    return null;
  }

  const encodedPath = encodeStorageObjectPath(normalizedPath);
  const renderedUrl = new URL(`${supabaseRenderedImageBaseUrl}/${encodedPath}`);
  const width = Number(options?.width);
  const height = Number(options?.height);
  const quality = Number(options?.quality);

  if (Number.isFinite(width) && width > 0) {
    renderedUrl.searchParams.set("width", String(Math.trunc(width)));
  }

  if (Number.isFinite(height) && height > 0) {
    renderedUrl.searchParams.set("height", String(Math.trunc(height)));
  }

  if (Number.isFinite(quality) && quality > 0) {
    renderedUrl.searchParams.set("quality", String(Math.trunc(quality)));
  }

  if (options?.resize) {
    renderedUrl.searchParams.set("resize", options.resize);
  }

  return renderedUrl.toString();
}
