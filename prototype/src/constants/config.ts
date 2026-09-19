function readEnv(name: keyof ImportMetaEnv): string {
  return import.meta.env[name]?.trim() ?? ''
}

function looksLikeHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

const supabaseUrl = readEnv('VITE_SUPABASE_URL')
const supabasePublishableKey = readEnv('VITE_SUPABASE_PUBLISHABLE_KEY')
const s2ApiBaseUrl = readEnv('VITE_S2_API_BASE_URL')
const s3ApiBaseUrl = readEnv('VITE_S3_API_BASE_URL')
const useMockFlag = readEnv('VITE_USE_MOCK')
const hasSupabaseConfig = supabaseUrl.length > 0 && supabasePublishableKey.length > 0

export const appConfig = {
  appName: 'AINA',
  useMock: useMockFlag === '' ? !hasSupabaseConfig : useMockFlag !== 'false',
  supabase: {
    url: supabaseUrl,
    publishableKey: supabasePublishableKey,
    hasUrl: supabaseUrl.length > 0,
    hasPublishableKey: supabasePublishableKey.length > 0,
    urlLooksLikeHttpUrl: looksLikeHttpUrl(supabaseUrl),
  },
  s2: {
    baseUrl: s2ApiBaseUrl,
    isConfigured: looksLikeHttpUrl(s2ApiBaseUrl),
  },
  s3: {
    baseUrl: s3ApiBaseUrl,
    isConfigured: looksLikeHttpUrl(s3ApiBaseUrl),
  },
} as const

export type AppConfig = typeof appConfig

export function getPublicConfigStatus() {
  return {
    useMock: appConfig.useMock,
    supabaseUrlPresent: appConfig.supabase.hasUrl,
    supabaseUrlLooksLikeHttpUrl: appConfig.supabase.urlLooksLikeHttpUrl,
    supabasePublishableKeyPresent: appConfig.supabase.hasPublishableKey,
    s2BaseUrlConfigured: appConfig.s2.isConfigured,
    s3BaseUrlConfigured: appConfig.s3.isConfigured,
  }
}
