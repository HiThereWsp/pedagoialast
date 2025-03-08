
import { useState, useEffect, useRef, useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook pour stabiliser le contenu et éviter les rechargements intempestifs
 * en gardant une référence stable aux données déjà chargées
 */
export function useStableContent() {
  const [stableContent, setStableContent] = useState<SavedContent[]>([]);
  const contentTimestamp = useRef<number>(0);
  const isInitialLoad = useRef(true);
  const previousContentRef = useRef<SavedContent[]>([]);
  const contentUpdateCount = useRef<number>(0);

  // Fonction pour mettre à jour le contenu de manière stable
  const updateContent = useCallback((newContent: SavedContent[]) => {
    // Log détaillé de l'opération de mise à jour
    console.log("📊 useStableContent.updateContent: Tentative de mise à jour du contenu stable", {
      nouveauxElements: newContent.length,
      elementsExistants: stableContent.length,
      estChargementInitial: isInitialLoad.current,
      miseAJourCount: contentUpdateCount.current
    });
    
    // CORRECTION: Si le contenu est vide et que ce n'est pas le chargement initial, 
    // on ne met pas à jour pour éviter les flashs, sauf si on n'a pas encore de contenu
    if (newContent.length === 0 && !isInitialLoad.current && stableContent.length > 0) {
      console.log("⚠️ Ignoré la mise à jour avec un tableau vide pour éviter les flashs");
      return;
    }

    const currentTime = Date.now();
    
    // N'appliquer la mise à jour que si:
    // - C'est le chargement initial (pour avoir des données au départ)
    // - Ou si le contenu n'est pas vide
    // - Ou si au moins 2 secondes se sont écoulées depuis la dernière mise à jour
    if (isInitialLoad.current || 
        newContent.length > 0 || 
        currentTime - contentTimestamp.current > 2000) {
      
      // Comparer les identifiants pour éviter les mises à jour inutiles
      const hasChanges = hasContentChanged(previousContentRef.current, newContent);
      
      if (hasChanges || isInitialLoad.current) {
        console.log(`✅ Mise à jour du contenu stable (${newContent.length} éléments)`);
        contentUpdateCount.current += 1;
        setStableContent(newContent);
        previousContentRef.current = newContent;
        contentTimestamp.current = currentTime;
        isInitialLoad.current = false;
      } else {
        console.log("ℹ️ Contenu inchangé, pas de mise à jour");
      }
    } else {
      console.log("⏱️ Délai minimum non respecté, mise à jour ignorée");
    }
  }, [stableContent.length]);

  // Vérifie si le contenu a changé en comparant les IDs
  const hasContentChanged = (oldContent: SavedContent[], newContent: SavedContent[]): boolean => {
    if (oldContent.length !== newContent.length) {
      console.log("🔄 Changement détecté: nombre d'éléments différent");
      return true;
    }
    
    // AMÉLIORATION: Vérifier aussi le nombre d'éléments par type pour une détection plus précise
    const countByType = (content: SavedContent[], type: string) => 
      content.filter(item => item.type === type).length;
    
    const types = ['lesson-plan', 'exercise', 'Image', 'correspondence'];
    for (const type of types) {
      const oldCount = countByType(oldContent, type);
      const newCount = countByType(newContent, type);
      if (oldCount !== newCount) {
        console.log(`🔄 Changement détecté: nombre d'éléments de type ${type} différent (${oldCount} → ${newCount})`);
        return true;
      }
    }
    
    // Créer des ensembles d'IDs pour une comparaison rapide
    const oldIds = new Set(oldContent.map(item => item.id));
    const newIds = new Set(newContent.map(item => item.id));
    
    // Vérifier si tous les IDs du nouveau contenu sont dans l'ancien
    for (const id of newIds) {
      if (!oldIds.has(id)) {
        console.log(`🔄 Changement détecté: nouvel élément ${id}`);
        return true;
      }
    }
    
    // Vérifier si tous les IDs de l'ancien contenu sont dans le nouveau
    for (const id of oldIds) {
      if (!newIds.has(id)) {
        console.log(`🔄 Changement détecté: élément supprimé ${id}`);
        return true;
      }
    }
    
    return false;
  };

  return { stableContent, updateContent };
}
