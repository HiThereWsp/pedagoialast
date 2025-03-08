
import { useEffect, useState, useCallback, useRef } from "react";
import { SEO } from "@/components/SEO";
import { type SavedContent } from "@/types/saved-content";
import { SavedContentLoader } from "@/components/saved-content/SavedContentLoader";
import { SavedContentError } from "@/components/saved-content/SavedContentError";
import { SavedContentList } from "@/components/saved-content/SavedContentList";
import { DeleteDialog } from "@/components/saved-content/DeleteDialog";
import { ContentPreviewSheet } from "@/components/saved-content/ContentPreviewSheet";
import { RefreshIndicator } from "@/components/saved-content/RefreshIndicator";
import { useSavedContentManagement } from "@/hooks/saved-content/useSavedContentManagement";
import { useStableContent } from "@/hooks/saved-content/useStableContent";
import { SavedContentHeader } from "@/components/saved-content/SavedContentHeader";
import { SavedContentTabs } from "@/components/saved-content/SavedContentTabs";

export default function SavedContentPage() {
  const [selectedContent, setSelectedContent] = useState<SavedContent | null>(null);
  const [activeTab, setActiveTab] = useState<string>('sequences');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: ""
  });
  
  const didInitialFetch = useRef(false);

  // Use stable content hook to prevent unnecessary rerenders
  const { stableContent, updateContent } = useStableContent();

  const {
    content,
    errors,
    isLoading,
    isRefreshing,
    fetchContent,
    handleDelete,
    cleanup
  } = useSavedContentManagement();

  // Update stable content when content changes
  useEffect(() => {
    if (content && content.length > 0) {
      updateContent(content);
    }
  }, [content, updateContent]);

  // Load data once after authentication
  useEffect(() => {
    if (!didInitialFetch.current) {
      console.log("Chargement initial des données...");
      didInitialFetch.current = true;
      fetchContent().catch(err => {
        console.error("Erreur lors du chargement initial:", err);
      });
    }
  }, [fetchContent]);

  // Async handleRefresh - fixes TypeScript error
  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!isRefreshing) {
      try {
        const refreshedContent = await fetchContent();
        console.log(`Rafraîchissement terminé: ${refreshedContent.length} éléments chargés`);
        return Promise.resolve();
      } catch (error) {
        console.error("Erreur lors du rafraîchissement:", error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }, [fetchContent, isRefreshing]);

  const handleDeleteRequest = useCallback((content: SavedContent) => {
    setIsPreviewOpen(false);
    setDeleteDialog({
      isOpen: true,
      itemId: content.id,
      itemType: content.displayType || ""
    });
  }, []);

  // Cleanup resources only on unmount
  useEffect(() => {
    return () => {
      console.log("Nettoyage lors du démontage de SavedContentPage");
      cleanup?.();
    };
  }, [cleanup]);

  // Show loading only during initial load
  if (isLoading && !isRefreshing && stableContent.length === 0) {
    return <SavedContentLoader activeTab={activeTab} />;
  }

  if (errors.exercises || errors.lessonPlans || errors.correspondences) {
    return (
      <SavedContentError 
        error={errors.exercises || errors.lessonPlans || errors.correspondences || ""}
        onRetry={handleRefresh}
      />
    );
  }

  return (
    <>
      <SEO 
        title="Mes ressources | PedagoIA"
        description="Consultez l'historique de vos contenus générés sur PedagoIA - exercices, séquences et documents administratifs."
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SavedContentHeader 
          activeTab={activeTab}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
        
        <SavedContentTabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {isRefreshing ? (
          <RefreshIndicator />
        ) : (
          <SavedContentList
            content={stableContent}
            onItemSelect={(item) => {
              setSelectedContent(item);
              setIsPreviewOpen(true);
            }}
            selectedItemId={selectedContent?.id}
            activeTab={activeTab}
          />
        )}
      </div>

      <ContentPreviewSheet
        content={selectedContent}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onDelete={handleDeleteRequest}
      />

      <DeleteDialog 
        isOpen={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog(prev => ({ ...prev, isOpen }))}
        onDelete={async () => {
          const item = stableContent.find(item => item.id === deleteDialog.itemId);
          if (item) {
            await handleDelete(deleteDialog.itemId, item.type);
            setDeleteDialog(prev => ({ ...prev, isOpen: false }));
          }
        }}
        itemType={deleteDialog.itemType}
        error={errors.delete}
      />
    </>
  );
}
