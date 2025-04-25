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

// Fonction pour vérifier les cookies d'authentification existants
const checkForExistingCookies = () => {
  try {
    const cookies = document.cookie.split(';').map(c => c.trim());
    const authCookie = cookies.find(c => c.startsWith('sb-jpelncawdaounkidvymu-auth-token='));
    
    console.error("AUTH_DEBUG: Vérification des cookies", { 
      cookiesFound: cookies.length,
      authCookieFound: !!authCookie,
      cookies: cookies.map(c => c.split('=')[0])
    });
    
    return !!authCookie;
  } catch (err) {
    console.error("Erreur lors de la vérification des cookies:", err);
    return false;
  }
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

        if (authCheckCompleted.current) {
          console.log("Vérification d'auth déjà effectuée, ignorée");
          return;
        }

        // Check for existing cookies and force session check if found
        if (checkForExistingCookies() && !authCheckCompleted.current) {
          console.log("Cookie d'authentification trouvé, tentative de restauration de session");
          // Force refresh session to handle cookies from other domains
          const { data: refreshData, error: refreshError } = await supabase.auth.getSession();
          if (refreshData?.session && !refreshError) {
            console.log("Session restaurée depuis les cookies:", refreshData.session.user.email);
          }
        }

        // Check local storage for session
        const storedSession = localStorage.getItem("supabase.auth.token");
        console.log("Stored session in local storage:", storedSession ? "Found" : "Not found");

        // Restore session from local storage
        console.log("Fetching session from Supabase...");
        const { data: sessionData, error: sessionError } = await fetchWithTimeout(
            supabase.auth.getSession(),
            5000
        );
        console.log("GetSession response:", { sessionData, sessionError });
        if (sessionError) throw sessionError;
        if (sessionData.session) {
          console.log("Session found, setting user:", sessionData.session.user.email);
          setUser(sessionData.session.user);
          
          // Stocker l'email pour les vérifications futures
          try {
            localStorage.setItem('last_user_email', sessionData.session.user.email);
            console.log("Email utilisateur stocké dans localStorage:", sessionData.session.user.email);
          } catch (e) {
            console.error("Erreur lors du stockage de l'email utilisateur:", e);
          }
          
          setAuthReady(true);
          setLoading(false);
          authCheckCompleted.current = true;
          
          // Ajouter les cookies partagés au chargement initial s'il y a une session
          writeSharedSessionCookies(sessionData.session);
        } else {
          console.log("No session found");
        }

        if (isPublicPage()) {
          console.log("Page publique détectée, vérification minimale");
          setUser(null);
          setAuthReady(true);
          setLoading(false);
          authCheckCompleted.current = true;
          return;
        }

        const checkSession = debounce(async () => {
          console.log("Fetching user from Supabase...");
          const { data, error } = await fetchWithTimeout(supabase.auth.getUser(), 5000);
          console.log("GetUser response:", { data, error });

          if (error || !data.user) {
            console.log("No user found or error:", error?.message || "No user data");
            if (mounted) {
              setUser(null);
              setAuthReady(true);
              setLoading(false);
              authCheckCompleted.current = true;
              if (!isPublicPage()) {
                toast({
                  title: "Erreur d'authentification",
                  description: "Veuillez vous reconnecter.",
                  variant: "destructive",
                });
              }
            }
            return;
          }

          const currentUserJSON = JSON.stringify(data.user);
          const previousUserJSON = previousSession.current
              ? JSON.stringify(previousSession.current)
              : null;

          if (currentUserJSON !== previousUserJSON) {
            previousSession.current = data.user;

            if (mounted && data.user) {
              setUser(data.user);
              authCheckCompleted.current = true;
              setAuthReady(true);
              setLoading(false);
            }
          } else if (mounted) {
            authCheckCompleted.current = true;
            setAuthReady(true);
            setLoading(false);
          }
        }, 1000);

        checkSession();
      } catch (error) {
        console.error("Exception lors de la vérification de l'utilisateur:", error);
        if (!isPublicPage() && mounted) {
          toast({
            title: "Erreur d'authentification",
            description: "Une erreur est survenue lors de la vérification de votre session.",
            variant: "destructive",
          });
        }

        if (mounted) {
          setUser(null);
          setLoading(false);
          setAuthReady(true);
          authCheckCompleted.current = true;
        }
      }
    };

    const setupAuthListener = async () => {
      try {
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
      } catch (err) {
        console.error("Erreur dans setupAuthListener:", err);
        if (mounted) {
          setUser(null);
          setLoading(false);
          setAuthReady(true);
        }
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