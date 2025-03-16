import { useState, useEffect, useRef, useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";
import { CONTENT_UPDATE_THROTTLE } from "./constants";

/**
 * Hook for maintaining stable content references and preventing unnecessary re-renders
 * by throttling updates and comparing content changes
 */
export function useStableContent() {
  const [stableContent, setStableContent] = useState<SavedContent[]>([]);
  const previousContentRef = useRef<SavedContent[]>([]);
  const isInitialLoad = useRef(true);
  const forcedUpdate = useRef<boolean>(false);
  const lastUpdateTime = useRef<number>(Date.now());
  const pendingUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Track content history for debugging (limited to last 3 updates)
  const contentHistory = useRef<SavedContent[][]>([]);

  // Clean up any pending timers on unmount
  useEffect(() => {
    return () => {
      if (pendingUpdateTimer.current) {
        clearTimeout(pendingUpdateTimer.current);
      }
    };
  }, []);

  /**
   * Checks if content has changed by comparing IDs, counts by type, and update timestamps
   */
  const hasContentChanged = (oldContent: SavedContent[], newContent: SavedContent[]): boolean => {
    // Different lengths means content has changed
    if (oldContent.length !== newContent.length) {
      console.log("🔄 Changement détecté: nombre d'éléments différent");
      return true;
    }
    
    // Count elements by type for quick comparison
    const types = ['lesson-plan', 'exercise', 'Image', 'correspondence'];
    for (const type of types) {
      const oldCount = oldContent.filter(item => item.type === type).length;
      const newCount = newContent.filter(item => item.type === type).length;
      if (oldCount !== newCount) {
        console.log(`🔄 Changement détecté: nombre d'éléments de type ${type} différent (${oldCount} → ${newCount})`);
        return true;
      }
    }
    
    // Compare IDs using Set for efficiency
    const oldIds = new Set(oldContent.map(item => item.id));
    const newIds = new Set(newContent.map(item => item.id));
    
    // Check for added or removed items
    for (const id of newIds) {
      if (!oldIds.has(id)) return true;
    }
    
    for (const id of oldIds) {
      if (!newIds.has(id)) return true;
    }
    
    // Check for updated items
    for (let i = 0; i < oldContent.length; i++) {
      const oldItem = oldContent[i];
      const newItem = newContent.find(item => item.id === oldItem.id);
      
      if (newItem && oldItem.updated_at !== newItem.updated_at) {
        return true;
      }
    }
    
    return false;
  };

  /**
   * Updates the content state if it has changed or if a forced update is requested
   */
  const updateContent = useCallback((newContent: SavedContent[]) => {
    // Clear any pending updates
    if (pendingUpdateTimer.current) {
      clearTimeout(pendingUpdateTimer.current);
      pendingUpdateTimer.current = null;
    }
    
    // Log detailed update information
    console.log("📊 useStableContent.updateContent: Mise à jour du contenu stable", {
      nouveauxElements: newContent.length,
      elementsExistants: stableContent.length,
      estChargementInitial: isInitialLoad.current,
      forcedUpdate: forcedUpdate.current
    });
    
    // Keep track of content history for debugging
    if (newContent.length > 0) {
      contentHistory.current.push([...newContent]);
      if (contentHistory.current.length > 3) {
        contentHistory.current.shift();
      }
    }
    
    // Handle forced updates immediately
    if (forcedUpdate.current) {
      console.log("🔥 Mise à jour forcée du contenu stable");
      setStableContent(newContent);
      previousContentRef.current = [...newContent];
      lastUpdateTime.current = Date.now();
      isInitialLoad.current = false;
      forcedUpdate.current = false;
      return;
    }
    
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateTime.current;
    
    // Update if: initial load, content changed, or enough time has passed since last update
    if (newContent.length > 0 && (
        isInitialLoad.current || 
        hasContentChanged(previousContentRef.current, newContent) ||
        timeSinceLastUpdate > CONTENT_UPDATE_THROTTLE
      )) {
      console.log(`✅ Mise à jour du contenu stable avec ${newContent.length} éléments (temps écoulé: ${timeSinceLastUpdate}ms)`);
      setStableContent(newContent);
      previousContentRef.current = [...newContent];
      lastUpdateTime.current = now;
      isInitialLoad.current = false;
      return;
    }
    
    // Handle empty content updates carefully
    if (newContent.length === 0 && !isInitialLoad.current && stableContent.length > 0) {
      const hasRecentValidData = contentHistory.current.some(history => history.length > 0);
      
      if (hasRecentValidData) {
        console.log("⚠️ Contenu vide ignoré car historique récent contient des données");
        return;
      }
      
      console.log("🔄 Mise à jour avec contenu vide (aucune donnée récente)");
      setStableContent(newContent);
      previousContentRef.current = [...newContent];
      lastUpdateTime.current = now;
    }
  }, [stableContent.length]);

  /**
   * Forces content refresh by resetting state flags
   */
  const forceRefresh = useCallback(() => {
    console.log("🔄 Forçage de la mise à jour du contenu stable");
    isInitialLoad.current = true;
    forcedUpdate.current = true;
    lastUpdateTime.current = 0;
  }, []);

  return { 
    stableContent, 
    updateContent,
    forceRefresh
  };
}
