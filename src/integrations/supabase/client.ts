
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Définition des constantes pour l'URL et la clé
const SUPABASE_URL = 'https://jpelncawdaounkidvymu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZWxuY2F3ZGFvdW5raWR2eW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzgxNTEsImV4cCI6MjA0ODQxNDE1MX0.tzGxd93BPGQa8w4BRb6AOujbIjvI-XEIgU7SlnlZZt4';

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
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  }
);

// Listener pour les événements d'authentification
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Événement d\'authentification:', event);
  if (session) {
    console.log('Session active:', session.user?.email);
  } else {
    console.log('Aucune session active');
  }
});

// Fonction pour vérifier l'état de la connexion
export const checkConnection = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erreur de connexion Supabase:', error.message);
      return false;
    }
    return !!session;
  } catch (err) {
    console.error('Erreur inattendue:', err);
    return false;
  }
};
