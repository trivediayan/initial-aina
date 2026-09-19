import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function looksLikeHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim() ?? ''
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() ?? ''

export const isSupabaseConfigured =
  looksLikeHttpUrl(supabaseUrl) && supabaseKey.length > 0

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null
