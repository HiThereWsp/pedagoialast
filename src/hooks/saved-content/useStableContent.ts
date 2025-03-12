import { useState, useEffect, useRef, useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";
import { CONTENT_UPDATE_THROTTLE } from "./constants";

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
  const lastUpdateTime = useRef<number>(Date.now());

  // CORRECTION CRITIQUE: Fonction pour mettre à jour le contenu de manière stable
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
    
    // Vérifier si les éléments ont des types valides pour le débogage
    if (newContent.length > 0) {
      const typesStats = newContent.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("📋 Types des éléments reçus:", typesStats);
      console.log("📋 Exemple d'élément:", { 
        id: newContent[0].id,
        title: newContent[0].title,
        type: newContent[0].type 
      });
    }
    
    // IMPORTANT: Conserver un historique limité des mises à jour pour débogage
    if (newContent.length > 0) {
      contentHistory.current.push([...newContent]);
      if (contentHistory.current.length > 3) {
        contentHistory.current.shift(); // Limiter l'historique à 3 entrées
      }
    }
    
    // CORRECTION CRITIQUE: Appliquer systématiquement les mises à jour forcées
    if (forcedUpdate.current) {
      console.log("🔥 Mise à jour forcée du contenu stable");
      contentUpdateCount.current += 1;
      // Utiliser directement setStableContent au lieu de setTimeout
      setStableContent(newContent);
      previousContentRef.current = [...newContent];
      contentTimestamp.current = Date.now();
      isInitialLoad.current = false;
      forcedUpdate.current = false;
      return;
    }
    
    // CORRECTION: Vérifier le throttling pour éviter des mises à jour trop fréquentes
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    // Si le nouveau contenu a des éléments, et soit:
    // - C'est le chargement initial
    // - Ou il y a des changements de contenu
    // - Ou le temps écoulé depuis la dernière mise à jour est suffisant
    if (newContent.length > 0 && (
        isInitialLoad.current || 
        hasContentChanged(previousContentRef.current, newContent) ||
        timeSinceLastUpdate > CONTENT_UPDATE_THROTTLE
      )) {
      console.log(`✅ Mise à jour du contenu stable avec ${newContent.length} éléments (temps écoulé: ${timeSinceLastUpdate}ms)`);
      contentUpdateCount.current += 1;
      // CORRECTION CRITIQUE: Utiliser directement setStableContent au lieu de setTimeout
      setStableContent(newContent);
      previousContentRef.current = [...newContent];
      contentTimestamp.current = now;
      lastUpdateTime.current = now;
      isInitialLoad.current = false;
      return;
    }
    
    // Si le nouveau contenu est vide et que nous avons déjà du contenu
    if (newContent.length === 0 && !isInitialLoad.current && stableContent.length > 0) {
      console.log("⚠️ Contenu vide reçu mais contenu existant préservé");
      
      // CORRECTION: Ne pas utiliser de timer, vérifier immédiatement
      // Vérifier si un des tableaux historiques récents contient des données
      const hasRecentValidData = contentHistory.current.some(history => history.length > 0);
      
      if (hasRecentValidData) {
        console.log("⚠️ Contenu vide ignoré car historique récent contient des données");
        return;
      }
      
      // Si vraiment aucune donnée récente, on peut mettre à jour avec le contenu vide
      console.log("🔄 Mise à jour avec contenu vide (aucune donnée récente)");
      contentUpdateCount.current += 1;
      setStableContent(newContent);
      previousContentRef.current = [...newContent];
      contentTimestamp.current = now;
      lastUpdateTime.current = now;
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

  // Force le rafraîchissement du contenu et réinitialise le state
  const forceRefresh = useCallback(() => {
    console.log("🔄 Forçage de la mise à jour du contenu stable");
    isInitialLoad.current = true;
    forcedUpdate.current = true;
    // CORRECTION CRITIQUE: on garantit que l'état forcé est immédiatement pris en compte
    lastUpdateTime.current = 0; // Réinitialiser le temps de la dernière mise à jour
  }, []);

  return { 
    stableContent, 
    updateContent,
    forceRefresh,
    contentHistory: contentHistory.current // Exposer l'historique pour débogage si nécessaire
  };
}
