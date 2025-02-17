
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jpelncawdaounkidvymu.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZWxuY2F3ZGFvdW5raWR2eW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzgxNTEsImV4cCI6MjA0ODQxNDE1MX0.tzGxd93BPGQa8w4BRb6AOujbIjvI-XEIgU7SlnlZZt4";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sb-jpelncawdaounkidvymu-auth-token',
    },
    global: {
      headers: {
        'x-client-info': 'pedagoia-web',
      },
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Ajout d'un intercepteur pour déboguer les erreurs d'authentification
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Événement auth Supabase:', event);
  if (session) {
    console.log('Session active:', session.user?.email);
  } else {
    console.log('Aucune session active');
  }
});

// Fonction utilitaire pour vérifier la connexion
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erreur de connexion Supabase:', error);
      return false;
    }
    console.log('Connexion Supabase OK, session:', data.session ? 'active' : 'inactive');
    return true;
  } catch (err) {
    console.error('Erreur inattendue lors de la vérification de la connexion:', err);
    return false;
  }
};
