
import { useEffect } from "react";
import { toast } from "../toast/toast"; // Utilisation directe de toast

/**
 * Hook for handling initial content loading
 */
export function useInitialContentLoad(
  didInitialFetch: React.MutableRefObject<boolean>,
  fetchContent: () => Promise<any[]>,
  forceRefresh: () => void,
  invalidateCache: () => void,
  authReady: boolean,
  user: any | null
) {
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
        
        forceRefresh();
        
        try {
          invalidateCache();
          
          const data = await fetchContent();
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
              }
            }, 600);
          }
        } catch (err) {
          console.error("❌ SavedContentPage: Erreur lors du chargement initial:", err);
        }
      }
    };
    
    loadContentData();
  }, [fetchContent, forceRefresh, invalidateCache, authReady, user, didInitialFetch]);
}
