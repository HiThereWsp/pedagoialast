
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
  const pendingUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const forcedUpdate = useRef<boolean>(false);
  const contentHistory = useRef<SavedContent[][]>([]);  // Historique des mises à jour

  // Fonction pour mettre à jour le contenu de manière stable - OPTIMISÉE
  const updateContent = useCallback((newContent: SavedContent[]) => {
    // Nettoyer tout timer en attente
    if (pendingUpdateTimer.current) {
      clearTimeout(pendingUpdateTimer.current);
      pendingUpdateTimer.current = null;
    }
    
    // Log détaillé de l'opération de mise à jour
    console.log("📊 useStableContent.updateContent: Mise à jour du contenu stable", {
      nouveauxElements: newContent.length,
      elementsExistants: stableContent.length,
      estChargementInitial: isInitialLoad.current,
      miseAJourCount: contentUpdateCount.current,
      forcedUpdate: forcedUpdate.current
    });
    
    // IMPORTANT: Conserver un historique limité des mises à jour pour débogage
    if (newContent.length > 0) {
      contentHistory.current.push([...newContent]);
      if (contentHistory.current.length > 3) {
        contentHistory.current.shift(); // Limiter l'historique à 3 entrées
      }
    }
    
    // Forcer la mise à jour si demandé explicitement
    if (forcedUpdate.current) {
      console.log("🔥 Mise à jour forcée du contenu stable");
      contentUpdateCount.current += 1;
      setStableContent(newContent);
      previousContentRef.current = [...newContent];
      contentTimestamp.current = Date.now();
      isInitialLoad.current = false;
      forcedUpdate.current = false;
      return;
    }
    
    // Si le nouveau contenu a des éléments, le mettre à jour immédiatement
    if (newContent.length > 0) {
      const hasChanges = hasContentChanged(previousContentRef.current, newContent);
      
      if (hasChanges || isInitialLoad.current) {
        console.log(`✅ Mise à jour du contenu stable avec ${newContent.length} éléments`);
        contentUpdateCount.current += 1;
        setStableContent(newContent);
        previousContentRef.current = [...newContent];
        contentTimestamp.current = Date.now();
        isInitialLoad.current = false;
      } else {
        console.log("ℹ️ Contenu inchangé, pas de mise à jour");
      }
      return;
    }
    
    // Si le nouveau contenu est vide et que nous avons déjà du contenu, ne pas écraser 
    // le contenu existant immédiatement, attendre pour voir si d'autres mises à jour arrivent
    if (newContent.length === 0 && !isInitialLoad.current && stableContent.length > 0) {
      console.log("⏱️ Contenu vide reçu mais contenu existant préservé temporairement");
      
      // Réduire le délai d'attente à 1.5 secondes pour plus de réactivité
      pendingUpdateTimer.current = setTimeout(() => {
        console.log("⏱️ Délai d'attente écoulé pour la validation du contenu vide");
        
        // IMPORTANTE AMÉLIORATION: Ne jamais remplacer du contenu existant par un tableau vide
        // sauf si nous sommes certains que c'est intentionnel (utilisateur a tout supprimé)
        if (stableContent.length > 0 && contentHistory.current.length < 2) {
          console.log("⚠️ Contenu vide ignoré car nous avons du contenu existant");
          return;
        }
        
        // Vérifier si on a reçu une mise à jour entre temps
        const hasChanges = hasContentChanged(previousContentRef.current, newContent);
        
        if (hasChanges) {
          console.log("✅ Mise à jour du contenu stable avec contenu vide après délai");
          contentUpdateCount.current += 1;
          setStableContent(newContent);
          previousContentRef.current = [...newContent];
          contentTimestamp.current = Date.now();
        } else {
          console.log("⚠️ Ignoré la mise à jour avec un tableau vide après délai");
        }
      }, 1500);  // Réduit de 2000ms à 1500ms
      
      return;
    }

    const currentTime = Date.now();
    
    // Cas de figure où on applique la mise à jour immédiatement:
    // - C'est le chargement initial (pour avoir des données au départ)
    // - Ou si le contenu n'est pas vide
    // - Ou si au moins 1 seconde s'est écoulée depuis la dernière mise à jour (réduit pour réactivité)
    if (isInitialLoad.current || 
        newContent.length > 0 || 
        currentTime - contentTimestamp.current > 1000) {
      
      // Comparer les identifiants pour éviter les mises à jour inutiles
      const hasChanges = hasContentChanged(previousContentRef.current, newContent);
      
      if (hasChanges || isInitialLoad.current) {
        console.log(`✅ Mise à jour du contenu stable (${newContent.length} éléments)`);
        contentUpdateCount.current += 1;
        setStableContent(newContent);
        previousContentRef.current = [...newContent];
        contentTimestamp.current = currentTime;
        isInitialLoad.current = false;
      } else {
        console.log("ℹ️ Contenu inchangé, pas de mise à jour");
      }
    } else {
      console.log("⏱️ Délai minimum non respecté, mise à jour ignorée");
    }
  }, [stableContent.length]);

  // Nettoyer les ressources lors du démontage
  useEffect(() => {
    return () => {
      if (pendingUpdateTimer.current) {
        clearTimeout(pendingUpdateTimer.current);
        pendingUpdateTimer.current = null;
      }
    };
  }, []);

  // Vérifie si le contenu a changé en comparant les IDs et autres propriétés
  const hasContentChanged = (oldContent: SavedContent[], newContent: SavedContent[]): boolean => {
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
  };

  // Force le rafraîchissement du contenu
  const forceRefresh = useCallback(() => {
    console.log("🔄 Forçage de la mise à jour du contenu stable");
    isInitialLoad.current = true;
    forcedUpdate.current = true;
  }, []);

  return { 
    stableContent, 
    updateContent,
    forceRefresh,
    contentHistory: contentHistory.current // Exposer l'historique pour débogage si nécessaire
  };
}
