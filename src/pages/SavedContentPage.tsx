
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
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waitTimeRef = useRef(0);
  const { toast } = useToast();

  // Use stable content hook to prevent unnecessary rerenders
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

  // CORRECTION CRITIQUE: Mettre à jour le contenu stable seulement lorsque le contenu change
  // ET qu'il n'est pas vide, pour éviter de perdre les données déjà chargées
  useEffect(() => {
    console.log(`📊 SavedContentPage: Analyse de la mise à jour du contenu: ${content.length} éléments`);
    
    // Toujours mettre à jour le contenu stable avec les nouvelles données
    updateContent(content);
  }, [content, updateContent]);

  // Mettre en place un timer pour incrémenter le temps d'attente
  useEffect(() => {
    if (isRefreshing || isLoading) {
      // Réinitialiser le compteur au début du chargement
      waitTimeRef.current = 0;
      
      // Incrémenter le temps d'attente toutes les secondes
      loadingTimeoutRef.current = setInterval(() => {
        waitTimeRef.current += 1;
      }, 1000);
    } else {
      // Arrêter le timer quand le chargement est terminé
      if (loadingTimeoutRef.current) {
        clearInterval(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (loadingTimeoutRef.current) {
        clearInterval(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, [isRefreshing, isLoading]);

  // Load data once after authentication
  useEffect(() => {
    if (!didInitialFetch.current) {
      console.log("📥 SavedContentPage: Chargement initial des données...");
      didInitialFetch.current = true;
      
      // Forcer le rafraîchissement du contenu stable
      forceRefresh();
      
      fetchContent().then(data => {
        console.log(`✅ SavedContentPage: Chargement initial terminé: ${data.length} éléments chargés`);
        
        if (data.length === 0) {
          // Si aucun contenu n'est trouvé au premier chargement, on tente un rechargement forcé
          console.log("🔄 SavedContentPage: Aucun contenu trouvé, tentative de rechargement forcé");
          
          // Invalider le cache pour forcer une requête fraîche
          invalidateCache();
          
          setTimeout(() => {
            fetchContent().then(refreshedData => {
              console.log(`📊 SavedContentPage: Rechargement forcé terminé: ${refreshedData.length} éléments`);
              
              if (refreshedData.length === 0) {
                // Un double rechargement n'a rien donné, on notifie l'utilisateur
                toast({
                  description: "Aucun contenu trouvé. Créez votre premier contenu !",
                });
              }
            });
          }, 1500); // Délai réduit pour un rechargement plus rapide
        }
      }).catch(err => {
        console.error("❌ SavedContentPage: Erreur lors du chargement initial:", err);
      });
    }
  }, [fetchContent, toast, forceRefresh, invalidateCache]);

  // Async handleRefresh - fixes TypeScript error
  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!isRefreshing) {
      try {
        console.log("🔄 SavedContentPage: Lancement du rafraîchissement...");
        
        // Toujours invalider le cache pour forcer une requête fraîche lors d'un rafraîchissement manuel
        console.log("🧹 SavedContentPage: Invalidation du cache avant rafraîchissement manuel");
        invalidateCache();
        
        // Forcer le rafraîchissement du contenu stable
        forceRefresh();
        
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
  }, [fetchContent, isRefreshing, toast, stableContent.length, invalidateCache, forceRefresh]);

  const handleItemSelect = useCallback((item: SavedContent) => {
    setSelectedContent(item);
    setIsPreviewOpen(true);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // AJOUT: Refraîchir les données lors du changement d'onglet
    if (stableContent.length === 0 && !isLoading && !isRefreshing) {
      console.log(`🔄 Onglet changé vers ${tab}, rafraîchissement des données...`);
      // Déclencher un rafraîchissement sans toast si on n'a pas de contenu
      fetchContent().catch(err => {
        console.error("❌ Erreur lors du rafraîchissement après changement d'onglet:", err);
      });
    }
  }, [stableContent.length, isLoading, isRefreshing, fetchContent]);

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
      
      if (loadingTimeoutRef.current) {
        clearInterval(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
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
          <RefreshIndicator waitTime={waitTimeRef.current} />
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
