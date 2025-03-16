
import { useEffect, useRef, useCallback } from "react";
import { toast } from "@/hooks/use-toast"; // Utilisation directe de toast

/**
 * Hook pour gérer le chargement et le rafraîchissement du contenu
 */
export function useContentLoading(
  fetchContent: () => Promise<any[]>,
  invalidateCache: () => void,
  forceRefresh: () => void,
  isRefreshing: boolean,
  isLoading: boolean,
  stableContentLength: number
) {
  const didInitialFetch = useRef(false);
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitTimeRef = useRef(0);
  const fetchFailuresRef = useRef(0);

  // Set up timer for incrementing wait time
  useEffect(() => {
    if (isRefreshing || isLoading) {
      // Reset counter at start of loading
      waitTimeRef.current = 0;
      
      // Increment wait time every second
      loadingTimeoutRef.current = setInterval(() => {
        waitTimeRef.current += 1;
      }, 1000);
    } else {
      // Stop timer when loading is done
      if (loadingTimeoutRef.current) {
        clearInterval(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearInterval(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isRefreshing, isLoading]);

  // Handle content refresh
  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!isRefreshing) {
      try {
        console.log("🔄 SavedContentPage: Lancement du rafraîchissement manuel...");
        
        console.log("🧹 SavedContentPage: Invalidation du cache avant rafraîchissement manuel");
        invalidateCache();
        forceRefresh();
        
        const refreshedContent = await fetchContent();
        console.log(`✅ SavedContentPage: Rafraîchissement terminé: ${refreshedContent.length} éléments chargés`);
        
        if (refreshedContent.length === 0 && stableContentLength === 0) {
          // Utiliser toast directement au lieu de useToast
          toast({
            description: "Aucun contenu trouvé. Essayez de créer du nouveau contenu !",
          });
        }
        
        return Promise.resolve();
      } catch (error) {
        console.error("❌ SavedContentPage: Erreur lors du rafraîchissement:", error);
        fetchFailuresRef.current += 1;
        
        if (fetchFailuresRef.current > 2) {
          // Utiliser toast directement au lieu de useToast
          toast({
            variant: "destructive",
            title: "Problème de connexion",
            description: "Veuillez vous reconnecter pour résoudre le problème."
          });
        }
        
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }, [fetchContent, isRefreshing, stableContentLength, invalidateCache, forceRefresh]);

  return {
    didInitialFetch,
    waitTimeRef,
    fetchFailuresRef,
    handleRefresh
  };
}
