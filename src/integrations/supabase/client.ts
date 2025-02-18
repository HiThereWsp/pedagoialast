
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

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
      storageKey: 'supabase.auth.token'
    }
  }
);

// Listener pour les événements d'authentification avec plus de détails
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Événement d\'authentification:', event);
  if (session) {
    console.log('Session active:', session.user?.email);
    console.log('Token de session:', session.access_token ? 'Présent' : 'Absent');
    console.log('Expiration:', new Date(session.expires_at || 0).toLocaleString());
  } else {
    console.log('Aucune session active');
    if (event === 'SIGNED_OUT') {
      console.log('Déconnexion effectuée');
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token rafraîchi');
    }
  }
});

// Fonction améliorée pour vérifier l'état de la connexion
export const checkConnection = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Erreur de connexion Supabase:', error.message);
      return false;
    }
    
    if (!session) {
      console.log('Pas de session active');
      return false;
    }
    
    // Vérification de l'expiration du token
    if (session.expires_at && new Date(session.expires_at * 1000) < new Date()) {
      console.log('Session expirée');
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Erreur inattendue:', err);
    return false;
  }
};
