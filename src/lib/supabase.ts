import { createClient } from '@supabase/supabase-js';
import type { Resource } from '@/lib/models';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

const RESOURCES_BUCKET = 'resources';

/** Get the URL for a resource. Uses storage_path (resources bucket) when set, else url. */
export function getResourceUrl(resource: Pick<Resource, 'url' | 'storage_path'>): string | null {
  if (resource.storage_path) {
    const { data } = supabase.storage.from(RESOURCES_BUCKET).getPublicUrl(resource.storage_path);
    return data.publicUrl;
  }
  return resource.url ?? null;
}
