// providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { 
  syncAuthStateCrossDomain, 
  checkCrossDomainAuth, 
  clearCrossDomainAuth 
} from "@/utils/cross-domain-auth";
import metaConversionsService from "@/services/metaConversionsService";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  authReady: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authReady: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Fonction utilitaire de debounce pour limiter les appels fréquents
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: any[]) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
};

const fetchWithTimeout = async (promise: Promise<any>, timeoutMs: number) => {
  const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
  );
  return Promise.race([promise, timeout]);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const authCheckCompleted = useRef(false);
  const previousSession = useRef<any>(null);
  const { toast } = useToast();
  const location = useLocation();
  const previousUserRef = useRef<User | null>(null);

  const isPublicPage = () => {
    const publicPaths = [
      "/",
      "/bienvenue",
      "/login",
      "/signup",
      "/forgot-password",
      "/reset-password",
      "/confirm-email",
      "/contact",
      "/pricing",
      "/guide",
      "/terms",
      "/privacy",
      "/legal",
    ];
    return publicPaths.some((path) => location.pathname.startsWith(path));
  };

  useEffect(() => {
    let mounted = true;
    let subscription: any = null;

    const checkUser = async () => {
      try {
        console.log("Démarrage de la vérification d'authentification...");

        if (authCheckCompleted.current) {
          console.log("Vérification d'auth déjà effectuée, ignorée");
          return;
        }

        // Vérifier les cookies cross-domaine avant tout
        if (checkCrossDomainAuth() && !authCheckCompleted.current) {
          console.log("Cookie d'authentification cross-domaine détecté, tentative de restauration de session");
          // Force refresh session to handle cookies from other domains
          try {
            const { data: refreshData, error: refreshError } = await supabase.auth.getSession();
            if (refreshData?.session && !refreshError) {
              console.log("Session restaurée depuis les cookies cross-domaine:", refreshData.session.user.email);
            }
          } catch (err) {
            console.error("Erreur lors de la restauration de session depuis cookies:", err);
          }
        }

        // Continuer avec la vérification standard
        const { data: sessionData, error: sessionError } = await fetchWithTimeout(
          supabase.auth.getSession(),
          5000
        );

        if (sessionError) throw sessionError;

        // Si nous avons une session, définir l'utilisateur et synchroniser les cookies
        if (sessionData.session) {
          if (mounted) {
            setUser(sessionData.session.user);
            setAuthReady(true);
            setLoading(false);
            authCheckCompleted.current = true;
            
            // Synchroniser les cookies cross-domaine
            syncAuthStateCrossDomain(sessionData.session);
          }
        } else {
          // Si pas de session et page publique, c'est OK
          if (isPublicPage()) {
            if (mounted) {
              setUser(null);
              setAuthReady(true);
              setLoading(false);
              authCheckCompleted.current = true;
            }
          } else {
            // Si pas de session et page privée, rediriger
            if (mounted) {
              setUser(null);
              setAuthReady(true);
              setLoading(false);
              authCheckCompleted.current = true;
              toast({
                title: "Session expirée",
                description: "Veuillez vous reconnecter.",
                variant: "destructive",
              });
            }
          }
        }
      } catch (error) {
        console.error("Exception lors de la vérification de l'utilisateur:", error);
        if (mounted) {
          setUser(null);
          setAuthReady(true);
          setLoading(false);
          authCheckCompleted.current = true;
        }
      }
    };

    const setupAuthListener = async () => {
      await checkUser();

      if (mounted) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event, "Session:", !!session);
          const currentUser = session?.user ?? null;

          // Détecter un nouvel utilisateur connecté après une absence d'utilisateur
          if (!previousUserRef.current && currentUser && event === 'SIGNED_IN') {
            console.log('[Auth Event] New user signed in:', currentUser.email);
            
            // Vérifier si c'est une inscription (créé très récemment)
            // Heuristique: créé il y a moins de 60 secondes
            const createdAt = currentUser.created_at ? new Date(currentUser.created_at).getTime() : 0;
            const now = Date.now();
            const isRecentSignup = (now - createdAt) < 60000; 

            if (isRecentSignup) {
               console.log('[Meta CAPI] Detected recent signup, sending CompleteRegistration event for:', currentUser.email);
               const testEventCode = import.meta.env.VITE_META_TEST_EVENT_CODE || undefined;
               metaConversionsService.sendSignupCompletedEvent(
                 {
                   email: currentUser.email,
                   firstName: currentUser.user_metadata?.firstName,
                 },
                 {
                   test_event_code: testEventCode
                   // pixel_id: FB_PIXEL_IDS.SIGNUP // Déjà géré par la méthode du service
                 }
               ).catch(error => {
                 console.error('[Meta CAPI] Failed to send CompleteRegistration event:', error);
               });
            }
          }

          // Mettre à jour la référence de l'utilisateur précédent
          previousUserRef.current = currentUser;
          
          // Synchroniser les cookies cross-domaine à chaque changement d'état
          if (session) {
            syncAuthStateCrossDomain(session);
          } else if (event === 'SIGNED_OUT') {
            clearCrossDomainAuth();
          }
          
          if (mounted) {
            // Mettre à jour l'utilisateur de manière synchrone
            setUser(session?.user ?? null);
            setLoading(false);
            setAuthReady(true);
          }
        });

        subscription = data.subscription;
      }
    };

    setupAuthListener();

    return () => {
      mounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [toast, location.pathname]);

  console.log("Rendering AuthProvider, loading:", loading, "authReady:", authReady, "user:", user?.email);
  return (
      <AuthContext.Provider value={{ user, loading, authReady }}>
        {children}
      </AuthContext.Provider>
  );
};