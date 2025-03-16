
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isPublicPage } from "./authUtils";
import { toast } from "@/hooks/toast/toast";

/**
 * Hook to handle authentication session checks and listeners
 */
export function useAuthSession({
  setUser,
  setLoading,
  setAuthReady,
  authCheckCompleted
}) {
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe: () => void } | null = null;

    // Vérifie la session initiale avec une gestion d'erreur silencieuse pour les pages publiques
    const checkUser = async () => {
      try {
        console.log("Démarrage de la vérification d'authentification...");
        
        // Pour éviter les multiples vérifications
        if (authCheckCompleted.current) {
          console.log("Vérification d'auth déjà effectuée, ignorée");
          return;
        }
        
        // Sur les pages publiques, définir authReady = true immédiatement
        // pour éviter les vérifications de session non nécessaires
        if (isPublicPage(location.pathname)) {
          console.log("Page publique détectée, vérification minimale");
          if (mounted) {
            setAuthReady(true);
            setLoading(false);
            authCheckCompleted.current = true;
          }
          return;
        }
        
        // Ajout d'un délai maximum pour l'authentification
        const authTimeout = setTimeout(() => {
          if (mounted && !authCheckCompleted.current) {
            console.log("Timeout d'authentification atteint, définition de authReady=true");
            setAuthReady(true);
            setLoading(false);
            authCheckCompleted.current = true;
          }
        }, 5000); // 5 secondes maximum
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        // Nettoyer le timeout puisque nous avons obtenu une réponse
        clearTimeout(authTimeout);
        
        if (error) {
          console.error("Erreur lors de la vérification de l'utilisateur:", error);
          // Sur les pages publiques, ne pas afficher de toast d'erreur
          if (!isPublicPage(location.pathname) && mounted) {
            toast({
              title: "Erreur d'authentification",
              description: "Une erreur est survenue lors de la vérification de votre session.",
              variant: "destructive",
            });
          }
        }
        
        if (mounted) {
          setUser(user);
          authCheckCompleted.current = true;
          setAuthReady(true);
          setLoading(false);
        }
      } catch (error) {
        console.error("Exception lors de la vérification de l'utilisateur:", error);
        // Sur les pages publiques, ne pas afficher de toast d'erreur
        if (!isPublicPage(location.pathname) && mounted) {
          toast({
            title: "Erreur d'authentification",
            description: "Une erreur est survenue lors de la vérification de votre session.",
            variant: "destructive",
          });
        }
        
        if (mounted) {
          setLoading(false);
          setAuthReady(true); // Même en cas d'erreur, l'authentification est considérée comme "prête"
        }
      }
    };

    // Écoute les changements d'authentification avec gestion adaptée des erreurs
    const setupAuthListener = async () => {
      try {
        await checkUser();
        
        if (mounted) {
          const { data } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (mounted) {
                console.log("Auth state changed:", event);
                
                if (session?.user) {
                  console.log("Session active:", session.user.email);
                } else {
                  console.log("Pas de session active");
                }
                
                setUser(session?.user ?? null);
                setLoading(false);
                setAuthReady(true);
              }
            }
          );
          
          subscription = data.subscription;
        }
      } catch (err) {
        console.error("Erreur dans setupAuthListener:", err);
        if (mounted) {
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
  }, [location.pathname, setUser, setLoading, setAuthReady, authCheckCompleted]);

  return null;
}
