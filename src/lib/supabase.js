import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://scwyzonphgbhfirwwnov.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjd3l6b25waGdiaGZpcnd3bm92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzQ2MTMsImV4cCI6MjA2NzQxMDYxM30.XTqP3aOLIVfyw9kpdawVfqFAiYg8USJaZVLi478wq3I'
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey) 