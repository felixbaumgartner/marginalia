import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabase: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (supabase) return supabase;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be provided in environment variables');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

export async function initializeDatabase(): Promise<void> {
  const client = getSupabaseClient();
  console.log('Supabase client initialized');
}
