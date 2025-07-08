import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://scwyzonphgbhfirwwnov.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd3l6b25waGdiaGZpcnd3bm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzQ2MTMsImV4cCI6MjA2NzQxMDYxM30.XTqP3aOLIVfyw9kpdawVfqFAiYg8USJaZVLi478wq3I'
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  }
}) 