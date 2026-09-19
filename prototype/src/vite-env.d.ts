/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_S2_API_BASE_URL?: string
  readonly VITE_S3_API_BASE_URL?: string
  readonly VITE_CHATBOT_API_URL?: string
  readonly VITE_ADMIN_EMAIL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
