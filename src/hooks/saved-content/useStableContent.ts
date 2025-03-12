
import { useState, useEffect, useRef, useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";
import { CONTENT_UPDATE_THROTTLE } from "./constants";

export function useStableContent() {
  const [stableContent, setStableContent] = useState<SavedContent[]>([]);
  const contentTimestamp = useRef<number>(0);
  const isInitialLoad = useRef(true);
  const previousContentRef = useRef<SavedContent[]>([]);
  const contentHistory = useRef<SavedContent[][]>([]);

  // Fonction optimisée pour mettre à jour le contenu
  const updateContent = useCallback((newContent: SavedContent[]) => {
    // Log détaillé pour le débogage
    console.log("📊 useStableContent.updateContent:", {
      nouveauxElements: newContent.length,
      elementsExistants: stableContent.length,
      estChargementInitial: isInitialLoad.current
    });

    // Vérifier si le contenu a réellement changé
    const hasChanged = (
      isInitialLoad.current || 
      newContent.length !== previousContentRef.current.length ||
      JSON.stringify(newContent) !== JSON.stringify(previousContentRef.current)
    );

    if (hasChanged) {
      console.log("✅ Mise à jour du contenu stable avec nouveaux éléments");
      
      // Mettre à jour l'historique pour le débogage
      if (newContent.length > 0) {
        contentHistory.current = [
          ...contentHistory.current.slice(-2),
          [...newContent]
        ];
      }

      // Mettre à jour directement le state
      setStableContent(newContent);
      previousContentRef.current = [...newContent];
      contentTimestamp.current = Date.now();
      isInitialLoad.current = false;
    } else {
      console.log("ℹ️ Contenu identique, pas de mise à jour nécessaire");
    }
  }, [stableContent.length]);

  // Force le rafraîchissement du contenu
  const forceRefresh = useCallback(() => {
    console.log("🔄 Forçage du rafraîchissement du contenu stable");
    isInitialLoad.current = true;
    previousContentRef.current = [];
    contentTimestamp.current = 0;
  }, []);

  return {
    stableContent,
    updateContent,
    forceRefresh
  };
}
