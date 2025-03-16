
import { useEffect, useRef } from "react";
import { toast } from "../toast/toast"; // Utilisation directe de toast

/**
 * Hook for handling initial content loading with improved reliability
 */
export function useInitialContentLoad(
  didInitialFetch: React.MutableRefObject<boolean>,
  fetchContent: () => Promise<any[]>,
  forceRefresh: () => void,
  invalidateCache: () => void,
  authReady: boolean,
  user: any | null
) {
  // Référence pour le timeout de chargement
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load data once after authentication
  useEffect(() => {
    const loadContentData = async () => {
      // Check if authentication is ready and user is logged in
      if (!authReady || !user) {
        console.log("⏳ En attente de l'authentification...");
        return;
      }
      
      if (!didInitialFetch.current) {
        console.log("📥 SavedContentPage: Chargement initial des données...");
        didInitialFetch.current = true;
        
        // Définir un timeout pour le chargement
        loadingTimeoutRef.current = setTimeout(() => {
          console.log("⚠️ Timeout de chargement atteint");
          toast({
            description: "Le chargement prend plus de temps que prévu. Réessayez ou actualisez la page.",
          });
        }, 15000); // 15 secondes
        
        forceRefresh();
        
        try {
          invalidateCache();
          
          const data = await fetchContent();
          
          // Annuler le timeout puisque le chargement a réussi
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          
          console.log(`✅ SavedContentPage: Chargement initial terminé: ${data.length} éléments chargés`);
          
          if (data.length === 0) {
            console.log("🔄 SavedContentPage: Aucun contenu trouvé, tentative de rechargement forcé");
            
            invalidateCache();
            
            setTimeout(async () => {
              try {
                forceRefresh();
                
                const refreshedData = await fetchContent();
                console.log(`📊 SavedContentPage: Rechargement forcé terminé: ${refreshedData.length} éléments`);
                
                if (refreshedData.length === 0) {
                  toast({
                    description: "Aucun contenu trouvé. Créez votre premier contenu !",
                  });
                }
              } catch (error) {
                console.error("❌ Erreur lors du rechargement forcé:", error);
                toast({
                  variant: "destructive",
                  description: "Erreur lors du chargement des données. Veuillez réessayer.",
                });
              }
            }, 600);
          }
        } catch (err) {
          console.error("❌ SavedContentPage: Erreur lors du chargement initial:", err);
          
          // Annuler le timeout puisque le chargement a échoué
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
          
          toast({
            variant: "destructive",
            description: "Erreur lors du chargement des données. Veuillez réessayer.",
          });
        }
      }
    };
    
    loadContentData();
    
    return () => {
      // Nettoyer le timeout lors du démontage
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [fetchContent, forceRefresh, invalidateCache, authReady, user, didInitialFetch]);
}
