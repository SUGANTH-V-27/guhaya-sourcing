import { supabase, isSupabaseConfigured } from "./db/supabase-client";

const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "model-files";

export async function uploadModelFile(modelId: string, file: File): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `models/${modelId}/${Date.now()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
