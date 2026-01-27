/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_JITSI_DOMAIN?: string;
  readonly VITE_INSTAGRAM_CLIENT_ID?: string;
  readonly VITE_INSTAGRAM_CLIENT_SECRET?: string;
  readonly VITE_TIKTOK_CLIENT_KEY?: string;
  readonly VITE_TIKTOK_CLIENT_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
