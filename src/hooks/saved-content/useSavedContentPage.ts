
import { useState, useEffect } from "react";
import type { SavedContent } from "@/types/saved-content";
import { useSavedContentManagement } from "./useSavedContentManagement";
import { useStableContent } from "./useStableContent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useContentNavigation } from "./useContentNavigation";
import { useContentDeletionDialog } from "./useContentDeletionDialog";
import { useContentLoading } from "./useContentLoading";
import { useInitialContentLoad } from "./useInitialContentLoad";

export function useSavedContentPage() {
  const { toast } = useToast();
  const { user, authReady } = useAuth();

  const { stableContent, updateContent, forceRefresh } = useStableContent();

  const {
    content,
    errors,
    isLoading,
    isRefreshing,
    fetchContent,
    handleDelete,
    cleanup,
    invalidateCache
  } = useSavedContentManagement();

  // Use the refactored hooks
  const {
    selectedContent,
    activeTab, 
    isPreviewOpen,
    handleItemSelect,
    handleTabChange,
    handlePreviewOpenChange
  } = useContentNavigation();

  const {
    didInitialFetch,
    waitTimeRef,
    handleRefresh
  } = useContentLoading(
    fetchContent,
    invalidateCache,
    forceRefresh,
    isRefreshing,
    isLoading,
    stableContent.length
  );

  // Hook for delete dialog
  const handleActualDelete = async (itemId: string, itemType: string) => {
    const item = stableContent.find(item => item.id === itemId);
    if (item) {
      await handleDelete(itemId, item.type);
    }
  };

  const {
    deleteDialog,
    handleDeleteRequest,
    handleDeleteDialogChange,
    handleConfirmDelete
  } = useContentDeletionDialog(handleActualDelete);
  
  // Hook for authentication logging
  useEffect(() => {
    console.log("💡 État d'authentification sur SavedContentPage:", { 
      authReady, 
      user: user ? "connecté" : "non connecté",
      userId: user?.id,
      hasContent: content.length > 0,
      hasStableContent: stableContent.length > 0
    });
  }, [authReady, user, content.length, stableContent.length]);

  // Update stable content when content changes
  useEffect(() => {
    console.log(`📊 SavedContentPage: Analyse de la mise à jour du contenu: ${content.length} éléments`);
    updateContent(content);
  }, [content, updateContent]);

  // Initialize content loading
  useInitialContentLoad(
    didInitialFetch,
    fetchContent,
    forceRefresh,
    invalidateCache,
    authReady,
    user,
    toast
  );

  // Extended handleTabChange with content refresh
  const handleExtendedTabChange = (tab: string) => {
    handleTabChange(tab);
    
    if (stableContent.length === 0 && !isLoading && !isRefreshing) {
      console.log(`🔄 Onglet changé vers ${tab}, rafraîchissement des données...`);
      fetchContent().catch(err => {
        console.error("❌ Erreur lors du rafraîchissement après changement d'onglet:", err);
      });
    }
  };

  // Extended confirm delete with user check
  const handleExtendedConfirmDelete = async () => {
    if (!user || !user.id) {
      console.error("❌ Utilisateur non authentifié lors de la suppression");
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Veuillez vous reconnecter pour supprimer des contenus."
      });
      handleDeleteDialogChange(false);
      return;
    }
    
    await handleConfirmDelete(user.id);
  };

  // Cleanup resources only on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 SavedContentPage: Nettoyage lors du démontage");
      
      if (cleanup) {
        console.log("🧹 Exécution du nettoyage des ressources");
        cleanup();
      }
    };
  }, [cleanup]);

  return {
    // État
    selectedContent,
    activeTab,
    isPreviewOpen,
    deleteDialog,
    stableContent,
    errors,
    isLoading,
    isRefreshing,
    waitTimeRef,
    
    // Handlers
    handleItemSelect,
    handleTabChange: handleExtendedTabChange,
    handlePreviewOpenChange,
    handleDeleteRequest,
    handleDeleteDialogChange,
    handleConfirmDelete: handleExtendedConfirmDelete,
    handleRefresh,
    
    // Status
    hasError: !!(errors.exercises || errors.lessonPlans || errors.correspondences),
    errorMessage: errors.exercises || errors.lessonPlans || errors.correspondences || "",
    authReady
  };
}
