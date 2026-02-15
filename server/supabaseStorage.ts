import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "wiro-images";

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase credentials missing: set SUPABASE_URL and SUPABASE_SERVICE_KEY"
    );
  }

  return createClient(url, key);
}

/**
 * Upload a file to Supabase Storage bucket.
 * Returns the public URL for the uploaded file.
 */
export async function supabaseUpload(
  path: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<{ key: string; url: string }> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, data, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);

  return { key: path, url: publicUrl };
}

/**
 * Delete a file from Supabase Storage bucket.
 */
export async function supabaseDelete(path: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path]);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
}

/**
 * Get the public URL for a file in the bucket.
 */
export function supabasePublicUrl(path: string): string {
  const supabase = getSupabaseClient();
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(path);
  return publicUrl;
}
