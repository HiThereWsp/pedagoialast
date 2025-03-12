
import { useRef, useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";

/**
 * Hook pour gérer le cache des contenus sauvegardés
 */
export function useContentCache() {
  const cachedContentRef = useRef<SavedContent[]>([]);
  const pendingContentRef = useRef<SavedContent[] | null>(null);
  const dataWasReceivedRef = useRef(false);
  const contentHistory = useRef<SavedContent[][]>([]);

  // Fonction pour vérifier si le contenu a changé
  const hasContentChanged = useCallback((oldContent: SavedContent[], newContent: SavedContent[]): boolean => {
    // Si l'un des tableaux est vide et l'autre non, il y a un changement
    if (!oldContent.length && newContent.length) {
      console.log("🔄 Changement détecté: ancien contenu vide, nouveau contenu présent");
      return true;
    }
    
    if (oldContent.length && !newContent.length) {
      console.log("🔄 Changement détecté: ancien contenu présent, nouveau contenu vide");
      return true;
    }
    
    if (oldContent.length !== newContent.length) {
      console.log("🔄 Changement détecté: nombre d'éléments différent");
      return true;
    }
    
    // Vérifier aussi le nombre d'éléments par type pour une détection plus précise
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
    
    // Vérifier les dates de mise à jour pour détecter les modifications
    for (let i = 0; i < oldContent.length; i++) {
      const oldItem = oldContent[i];
      const newItem = newContent.find(item => item.id === oldItem.id);
      
      if (newItem && oldItem.updated_at !== newItem.updated_at) {
        console.log(`🔄 Changement détecté: élément ${oldItem.id} modifié`);
        return true;
      }
    }
    
    return false;
  }, []);

  // Méthode pour récupérer le contenu du cache
  const getCachedContent = useCallback(() => {
    return cachedContentRef.current;
  }, []);

  // Méthode pour mettre à jour le cache
  const updateCache = useCallback((content: SavedContent[]) => {
    if (content.length > 0) {
      console.log(`✅ Mise à jour du cache avec ${content.length} éléments`);
      // Ajouter à l'historique avant de mettre à jour le cache
      contentHistory.current.push([...content]);
      if (contentHistory.current.length > 3) {
        contentHistory.current.shift(); // Limiter l'historique à 3 entrées
      }
    }
    
    cachedContentRef.current = [...content];
    return cachedContentRef.current;
  }, []);

  // Méthode pour mettre à jour les données en attente
  const updatePendingContent = useCallback((content: SavedContent[] | null) => {
    pendingContentRef.current = content;
  }, []);

  // Méthode pour récupérer les données en attente
  const getPendingContent = useCallback(() => {
    return pendingContentRef.current;
  }, []);

  // Méthode pour savoir si des données ont été reçues
  const setDataReceived = useCallback((received: boolean) => {
    dataWasReceivedRef.current = received;
  }, []);

  // Méthode pour vérifier si des données ont été reçues
  const hasDataReceived = useCallback(() => {
    return dataWasReceivedRef.current;
  }, []);

  // Méthode pour invalider le cache
  const invalidateCache = useCallback(() => {
    console.log("🧹 Invalidation manuelle du cache");
    cachedContentRef.current = [];
    pendingContentRef.current = null;
    dataWasReceivedRef.current = false;
  }, []);

  return {
    getCachedContent,
    updateCache,
    updatePendingContent,
    getPendingContent,
    setDataReceived,
    hasDataReceived,
    invalidateCache,
    hasContentChanged
  };
}
