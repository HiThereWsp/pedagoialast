// providers/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { writeSharedSessionCookies, clearSharedSessionCookies } from "@/utils/session-cookies";

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
    let subscription: { unsubscribe: () => void } | null = null;

    const checkUser = async () => {
      try {
        console.log("Démarrage de la vérification d'authentification...");

        // Vérifier d'abord la session Supabase
        const { data: sessionData, error: sessionError } = await fetchWithTimeout(
          supabase.auth.getSession(),
          5000
        );

        if (sessionError) throw sessionError;

        // Si nous avons une session, définir l'utilisateur immédiatement
        if (sessionData.session) {
          if (mounted) {
            setUser(sessionData.session.user);
            setAuthReady(true);
            setLoading(false);
            
            // Ajouter les cookies partagés au chargement initial s'il y a une session
            writeSharedSessionCookies(sessionData.session);
          }
        } else {
          // Si pas de session et page publique, c'est OK
          if (isPublicPage()) {
            if (mounted) {
              setUser(null);
              setAuthReady(true);
              setLoading(false);
            }
          } else {
            // Si pas de session et page privée, rediriger
            if (mounted) {
              setUser(null);
              setAuthReady(true);
              setLoading(false);
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
        }
      }
    };

    const setupAuthListener = async () => {
      await checkUser();

      if (mounted) {
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log("Auth state changed:", event);
          
          // Mettre à jour les cookies partagés à chaque changement de session
          if (session) {
            writeSharedSessionCookies(session);
          } else if (event === 'SIGNED_OUT') {
            // Utiliser la fonction de nettoyage des cookies
            clearSharedSessionCookies();
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