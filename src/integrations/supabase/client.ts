import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const SUPABASE_URL = 'https://jpelncawdaounkidvymu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZWxuY2F3ZGFvdW5raWR2eW11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI4MzgxNTEsImV4cCI6MjA0ODQxNDE1MX0.tzGxd93BPGQa8w4BRb6AOujbIjvI-XEIgU7SlnlZZt4';

// Fonction pour détecter le mode navigation privée
const isPrivateMode = () => {
  try {
    // Tentative d'accès au localStorage - échoue souvent en mode privé
    localStorage.setItem('test', '1');
    localStorage.removeItem('test');
    return false;
  } catch (e) {
    return true;
  }
};

// Sélection du stockage approprié selon le contexte
const getStorage = () => {
  const privateMode = isPrivateMode();
  console.log('Mode navigation privée détecté:', privateMode);
  
  if (privateMode) {
    // En mode privé, utiliser le stockage en mémoire
    return {
      getItem: (key: string) => {
        return null; // Toujours retourne null - force une nouvelle session
      },
      setItem: (key: string, value: string) => {
        console.log('Stockage ignoré en mode privé');
      },
      removeItem: (key: string) => {
        console.log('Suppression ignorée en mode privé');
      }
    };
  }
  
  // En mode normal, utiliser localStorage
  return typeof window !== 'undefined' ? window.localStorage : undefined;
};

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storage: getStorage(),
      storageKey: 'supabase.auth.token',
    },
  }
);

// Listener pour les événements d'authentification avec plus de détails
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Événement d\'authentification:', event);
  if (session) {
    console.log('Session active:', session.user?.email);
    console.log('Token de session:', session.access_token ? 'Présent' : 'Absent');
    console.log('Expiration:', new Date(session.expires_at * 1000).toLocaleString());
    console.log('ID session:', session.user?.id);
  } else {
    console.log('Aucune session active');
    if (event === 'SIGNED_OUT') {
      console.log('Déconnexion effectuée');
    } else if (event === 'TOKEN_REFRESHED') {
      console.log('Token rafraîchi');
    } else if (event === 'USER_UPDATED') {
      console.log('Informations utilisateur mises à jour');
    } else if (event === 'PASSWORD_RECOVERY') {
      console.log('Récupération de mot de passe initiée');
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
