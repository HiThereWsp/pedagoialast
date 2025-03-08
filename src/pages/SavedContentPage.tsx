import React, { useEffect, useState, useCallback, useRef, useMemo } from "react";
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
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      console.log(`📊 SavedContentPage: Mise à jour du contenu stable avec ${content.length} éléments`);
      updateContent(content);
    }
  }, [content, updateContent]);

  // Load data once after authentication
  useEffect(() => {
    if (!didInitialFetch.current) {
      console.log("📥 SavedContentPage: Chargement initial des données...");
      didInitialFetch.current = true;
      
      fetchContent().then(data => {
        console.log(`✅ SavedContentPage: Chargement initial terminé: ${data.length} éléments chargés`);
        if (data.length === 0) {
          // Si aucun contenu n'est trouvé au premier chargement, on tente un rechargement forcé
          console.log("🔄 SavedContentPage: Aucun contenu trouvé, tentative de rechargement forcé");
          setTimeout(() => {
            fetchContent().then(refreshedData => {
              console.log(`📊 SavedContentPage: Rechargement forcé terminé: ${refreshedData.length} éléments`);
              if (refreshedData.length === 0) {
                toast({
                  description: "Aucun contenu trouvé. Créez votre premier contenu !",
                });
              }
            });
          }, 2000);
        }
      }).catch(err => {
        console.error("❌ SavedContentPage: Erreur lors du chargement initial:", err);
      });
    }
  }, [fetchContent, toast]);

  // Async handleRefresh - fixes TypeScript error
  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!isRefreshing) {
      try {
        console.log("🔄 SavedContentPage: Lancement du rafraîchissement...");
        const refreshedContent = await fetchContent();
        console.log(`✅ SavedContentPage: Rafraîchissement terminé: ${refreshedContent.length} éléments chargés`);
        
        if (refreshedContent.length === 0 && stableContent.length === 0) {
          toast({
            description: "Aucun contenu trouvé. Essayez de créer du nouveau contenu !",
          });
        }
        
        return Promise.resolve();
      } catch (error) {
        console.error("❌ SavedContentPage: Erreur lors du rafraîchissement:", error);
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }, [fetchContent, isRefreshing, toast, stableContent.length]);

  const handleItemSelect = useCallback((item: SavedContent) => {
    setSelectedContent(item);
    setIsPreviewOpen(true);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const handlePreviewOpenChange = useCallback((open: boolean) => {
    setIsPreviewOpen(open);
  }, []);

  const handleDeleteRequest = useCallback((content: SavedContent) => {
    setIsPreviewOpen(false);
    setDeleteDialog({
      isOpen: true,
      itemId: content.id,
      itemType: content.displayType || ""
    });
  }, []);

  const handleDeleteDialogChange = useCallback((isOpen: boolean) => {
    setDeleteDialog(prev => ({ ...prev, isOpen }));
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const item = stableContent.find(item => item.id === deleteDialog.itemId);
    if (item) {
      await handleDelete(deleteDialog.itemId, item.type);
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
    }
  }, [deleteDialog.itemId, stableContent, handleDelete]);

  // Cleanup resources only on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 SavedContentPage: Nettoyage lors du démontage");
      cleanup?.();
    };
  }, [cleanup]);

  // Determine if we should show an error state
  const hasError = useMemo(() => {
    return !!(errors.exercises || errors.lessonPlans || errors.correspondences);
  }, [errors.exercises, errors.lessonPlans, errors.correspondences]);

  // Combine error messages
  const errorMessage = useMemo(() => {
    return errors.exercises || errors.lessonPlans || errors.correspondences || "";
  }, [errors.exercises, errors.lessonPlans, errors.correspondences]);

  console.log("📊 SavedContentPage: État de la page:", { 
    isLoading, 
    isRefreshing, 
    hasError, 
    contentCount: stableContent.length,
    activeTab
  });

  // Show loading only during initial load
  if (isLoading && !isRefreshing && stableContent.length === 0) {
    return <SavedContentLoader activeTab={activeTab} />;
  }

  if (hasError) {
    return (
      <SavedContentError 
        error={errorMessage}
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
          onTabChange={handleTabChange}
        />

        {isRefreshing ? (
          <RefreshIndicator />
        ) : stableContent.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-balance font-bold text-gray-700 dark:text-gray-300 mb-2 tracking-tight">
              Aucun contenu disponible
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
              Créez votre premier contenu dès maintenant !
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Utilisez les outils de création pour générer des exercices, séquences ou documents.
            </p>
          </div>
        ) : (
          <SavedContentList
            content={stableContent}
            onItemSelect={handleItemSelect}
            selectedItemId={selectedContent?.id}
            activeTab={activeTab}
          />
        )}
      </div>

      <ContentPreviewSheet
        content={selectedContent}
        isOpen={isPreviewOpen}
        onOpenChange={handlePreviewOpenChange}
        onDelete={handleDeleteRequest}
      />

      <DeleteDialog 
        isOpen={deleteDialog.isOpen}
        onOpenChange={handleDeleteDialogChange}
        onDelete={handleConfirmDelete}
        itemType={deleteDialog.itemType}
        error={errors.delete}
      />
    </>
  );
}
