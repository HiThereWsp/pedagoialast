import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jpelncawdaounkidvymu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZWxuY2F3ZGFvdW5raWR2eW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzgxNTEsImV4cCI6MjA0ODQxNDE1MX0.tzGxd93BPGQa8w4BRb6AOujbIjvI-XEIgU7SlnlZZt4";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'pedagoia-auth-token',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-client-info': 'pedagoia-web'
      }
    }
  }
);