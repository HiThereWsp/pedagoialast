
import React from "react";
import { SavedContentContainer } from "./SavedContentContainer";
import { SavedContentList } from "./SavedContentList";
import { DeleteDialog } from "./DeleteDialog";
import { ContentPreviewSheet } from "./ContentPreviewSheet";
import { useAuth } from "@/hooks/useAuth";
import { useSavedContentManagement } from "@/hooks/saved-content/useSavedContentManagement";
import { useStableContent } from "@/hooks/saved-content/useStableContent";
import { useContentNavigation } from "@/hooks/saved-content/useContentNavigation";
import { useContentDeletionDialog } from "@/hooks/saved-content/useContentDeletionDialog";
import { useContentLoading } from "@/hooks/saved-content/useContentLoading";
import { useInitialContentLoad } from "@/hooks/saved-content/useInitialContentLoad";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from '@/hooks/use-mobile';

export const SavedContentView: React.FC = () => {
  const { toast } = useToast();
  const { user, authReady } = useAuth();
  const isMobile = useIsMobile();

  // Content management hooks
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

  // Navigation hooks
  const {
    selectedContent,
    activeTab, 
    isPreviewOpen,
    handleItemSelect,
    handleTabChange,
    handlePreviewOpenChange
  } = useContentNavigation();

  // Content loading hooks
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

  // Deletion dialog hooks
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
  
  // Initialize content loading
  useInitialContentLoad(
    didInitialFetch,
    fetchContent,
    forceRefresh,
    invalidateCache,
    authReady,
    user
  );

  // Update stable content when content changes
  React.useEffect(() => {
    console.log(`📊 SavedContentView: Mise à jour du contenu stable: ${content.length} éléments`);
    updateContent(content);
  }, [content, updateContent]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      console.log("🧹 SavedContentView: Nettoyage lors du démontage");
      if (cleanup) {
        cleanup();
      }
    };
  }, [cleanup]);

  // Extended tab change handler
  const handleExtendedTabChange = (tab: string) => {
    handleTabChange(tab);
    
    if (stableContent.length === 0 && !isLoading && !isRefreshing) {
      console.log(`🔄 Onglet changé vers ${tab}, rafraîchissement des données...`);
      fetchContent().catch(err => {
        console.error("❌ Erreur lors du rafraîchissement après changement d'onglet:", err);
      });
    }
  };

  // Extended confirm delete handler
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

  // Si l'authentification n'est pas prête, affiche le loader
  if (!authReady) {
    return <SavedContentContainer 
      isLoading={true}
      isRefreshing={false}
      hasError={false}
      errorMessage=""
      activeTab={activeTab}
      contentCount={0}
      waitTime={0}
      onRefresh={handleRefresh}
      onTabChange={handleTabChange}
      isMobileView={isMobile}
    >
      {null}
    </SavedContentContainer>;
  }

  return (
    <>
      <SavedContentContainer 
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        hasError={!!(errors.exercises || errors.lessonPlans || errors.correspondences)}
        errorMessage={errors.exercises || errors.lessonPlans || errors.correspondences || ""}
        activeTab={activeTab}
        contentCount={stableContent.length}
        waitTime={waitTimeRef.current}
        onRefresh={handleRefresh}
        onTabChange={handleExtendedTabChange}
        isMobileView={isMobile}
      >
        <SavedContentList
          content={stableContent}
          onItemSelect={handleItemSelect}
          selectedItemId={selectedContent?.id}
          activeTab={activeTab}
          isMobileView={isMobile}
        />
      </SavedContentContainer>

      <ContentPreviewSheet
        content={selectedContent}
        isOpen={isPreviewOpen}
        onOpenChange={handlePreviewOpenChange}
        onDelete={handleDeleteRequest}
      />

      <DeleteDialog 
        isOpen={deleteDialog.isOpen}
        onOpenChange={handleDeleteDialogChange}
        onDelete={handleExtendedConfirmDelete}
        itemType={deleteDialog.itemType}
        error={errors.delete}
      />
    </>
  );
};
