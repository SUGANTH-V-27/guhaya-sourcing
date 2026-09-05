import { supabase, isSupabaseConfigured } from "./db/supabase-client";

const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "model-files";

export async function uploadFile(
  folder: string,
  entityId: string,
  file: File,
  onProgress?: (progress: number) => void,
): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error("File storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const allowedTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ]);
  if (!file.type || (!file.type.startsWith("image/") && !allowedTypes.has(file.type))) {
    throw new Error("This file type is not supported.");
  }

  const maxSizeBytes = 15 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error("Files must be 15 MB or smaller.");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${folder}/${entityId}/${Date.now()}-${safeName}`;
  if (!onProgress) {
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });
    if (error) throw error;
  } else {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) throw new Error("File storage is not configured.");
    await new Promise<void>((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.open("POST", `${supabaseUrl}/storage/v1/object/${bucket}/${path}`);
      request.setRequestHeader("Authorization", `Bearer ${supabaseKey}`);
      request.setRequestHeader("apikey", supabaseKey);
      request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      request.setRequestHeader("cache-control", "3600");
      request.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
      request.onload = () => request.status >= 200 && request.status < 300
        ? resolve()
        : reject(new Error(`File upload failed (${request.status}).`));
      request.onerror = () => reject(new Error("File upload failed."));
      request.send(file);
    });
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadModelFile(modelId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
  return uploadFile("models", modelId, file, onProgress);
}
