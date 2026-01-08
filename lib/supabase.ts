import { createClient } from '@supabase/supabase-js';

// Lazy initialization - only create clients when actually used
let _supabase: ReturnType<typeof createClient> | null = null;
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;

export const getSupabase = () => {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables');
    }

    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
};

export const getSupabaseAdmin = () => {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase admin environment variables');
    }

    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  }
  return _supabaseAdmin;
};

// For backwards compatibility, export the getter functions as the clients
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_, prop) => getSupabase()[prop as keyof ReturnType<typeof createClient>]
});

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_, prop) => getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>]
});
