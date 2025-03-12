
import { useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { SavedContent } from "@/types/saved-content";
import { useFetchContent } from "./useFetchContent";
import { REQUEST_COOLDOWN } from "./constants";

/**
 * Hook optimisé pour gérer le chargement du contenu avec une meilleure gestion de cache
 */
export function useContentLoader() {
  const { user, authReady } = useAuth();
  const { toast } = useToast();
  const lastRequestTime = useRef<number>(0);
  const loadAttempts = useRef<number>(0);
  const cachedResponse = useRef<SavedContent[]>([]);
  
  // Hooks de récupération de contenu
  const {
    fetchContent: originalFetchContent,
    cancelFetch,
    invalidateCache: originalInvalidateCache,
    errors: fetchErrors,
    isLoading,
    isRefreshing,
    hasLoadedData,
    cleanupImageContent
  } = useFetchContent();

  /**
   * Vérifie si une demande doit être limitée (throttling)
   */
  const shouldThrottleRequest = useCallback((forceRefresh: boolean): boolean => {
    if (forceRefresh) return false; // Ne pas limiter les demandes forcées
    
    const now = Date.now();
    const elapsed = now - lastRequestTime.current;
    return elapsed < REQUEST_COOLDOWN;
  }, []);

  /**
   * Fonction avancée pour charger le contenu avec une meilleure gestion du cache
   */
  const loadContent = useCallback(async (forceRefresh = false): Promise<SavedContent[]> => {
    // Vérification de l'authentification
    if (!user || !user.id) {
      console.error("❌ Utilisateur non authentifié lors du chargement");
      
      // Si nous avons du contenu en cache, le retourner même si non authentifié
      if (cachedResponse.current.length > 0) {
        console.log("🔍 Utilisation du cache disponible malgré l'absence d'authentification");
        return cachedResponse.current;
      }
      
      return [];
    }

    // Limitation de fréquence pour éviter les requêtes trop fréquentes
    if (shouldThrottleRequest(forceRefresh)) {
      console.log("⏱️ Requête trop rapide, utilisation du cache récent");
      return cachedResponse.current;
    }

    try {
      // Incrémenter le compteur de tentatives pour des logs plus clairs
      loadAttempts.current++;
      console.log(`🔄 [Tentative ${loadAttempts.current}] Chargement du contenu (force: ${forceRefresh})...`);
      
      lastRequestTime.current = Date.now();
      
      // Appel à la fonction de récupération du contenu
      const content = await originalFetchContent({ forceRefresh });
      
      console.log(`✅ [Tentative ${loadAttempts.current}] Contenu chargé: ${content.length} éléments`);
      
      // Mise à jour du cache local
      if (content.length > 0 || forceRefresh) {
        cachedResponse.current = content;
      }
      
      return content;
    } catch (error) {
      console.error(`❌ [Tentative ${loadAttempts.current}] Erreur lors du chargement:`, error);
      
      // En cas d'erreur, utiliser le cache si disponible
      if (cachedResponse.current.length > 0) {
        console.log("🔄 Utilisation du cache après erreur de chargement");
        
        // Notification discrète pour informer l'utilisateur
        if (!forceRefresh) { // Éviter les toasts multiples lors des rafraîchissements manuels
          toast({
            description: "Utilisation des données en cache pendant la reconnexion...",
            duration: 3000,
          });
        }
        
        return cachedResponse.current;
      }
      
      return [];
    }
  }, [originalFetchContent, user, shouldThrottleRequest, toast]);

  /**
   * Fonction avancée pour invalider le cache
   */
  const invalidateCache = useCallback(() => {
    console.log("🧹 Invalidation du cache dans useContentLoader");
    
    // Vider le cache local
    cachedResponse.current = [];
    
    // Invalider le cache de récupération
    originalInvalidateCache();
    
    // Réinitialiser le compteur de tentatives pour les logs
    loadAttempts.current = 0;
  }, [originalInvalidateCache]);

  return {
    loadContent,
    cancelFetch,
    invalidateCache,
    fetchErrors,
    isLoading,
    isRefreshing,
    hasLoadedData,
    cleanupImageContent,
    authReady,
    user
  };
}
