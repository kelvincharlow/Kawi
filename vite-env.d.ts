/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_APP_TITLE: string
  readonly VITE_ENABLE_HTTPS: string
  readonly VITE_SECURE_COOKIES: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
