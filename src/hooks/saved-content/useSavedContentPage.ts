
import { useState, useEffect, useCallback, useRef } from "react";
import type { SavedContent } from "@/types/saved-content";
import { useSavedContentManagement } from "./useSavedContentManagement";
import { useStableContent } from "./useStableContent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useSavedContentPage() {
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
  const fetchFailuresRef = useRef(0);
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

  // Afficher explicitement les informations d'authentification pour le débogage
  useEffect(() => {
    console.log("💡 État d'authentification sur SavedContentPage:", { 
      authReady, 
      user: user ? "connecté" : "non connecté",
      userId: user?.id,
      hasContent: content.length > 0,
      hasStableContent: stableContent.length > 0
    });
  }, [authReady, user, content.length, stableContent.length]);

  // Mettre à jour le contenu stable immédiatement quand le contenu change
  useEffect(() => {
    console.log(`📊 SavedContentPage: Analyse de la mise à jour du contenu: ${content.length} éléments`);
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

  // Chargement des données une fois après l'authentification
  useEffect(() => {
    const loadContentData = async () => {
      // Vérifier que l'authentification est prête et que l'utilisateur est connecté
      if (!authReady || !user) {
        console.log("⏳ En attente de l'authentification...");
        return;
      }
      
      if (!didInitialFetch.current) {
        console.log("📥 SavedContentPage: Chargement initial des données...");
        didInitialFetch.current = true;
        
        forceRefresh();
        
        try {
          invalidateCache();
          
          const data = await fetchContent();
          console.log(`✅ SavedContentPage: Chargement initial terminé: ${data.length} éléments chargés`);
          
          if (data.length === 0) {
            console.log("🔄 SavedContentPage: Aucun contenu trouvé, tentative de rechargement forcé");
            
            invalidateCache();
            
            setTimeout(async () => {
              try {
                forceRefresh();
                
                const refreshedData = await fetchContent();
                console.log(`📊 SavedContentPage: Rechargement forcé terminé: ${refreshedData.length} éléments`);
                
                if (refreshedData.length === 0) {
                  toast({
                    description: "Aucun contenu trouvé. Créez votre premier contenu !",
                  });
                  fetchFailuresRef.current += 1;
                }
              } catch (error) {
                console.error("❌ Erreur lors du rechargement forcé:", error);
                fetchFailuresRef.current += 1;
              }
            }, 600);
          }
        } catch (err) {
          console.error("❌ SavedContentPage: Erreur lors du chargement initial:", err);
          fetchFailuresRef.current += 1;
        }
      }
    };
    
    loadContentData();
  }, [fetchContent, toast, forceRefresh, invalidateCache, authReady, user]);

  const handleRefresh = useCallback(async (): Promise<void> => {
    if (!isRefreshing) {
      try {
        console.log("🔄 SavedContentPage: Lancement du rafraîchissement manuel...");
        
        if (!user || !user.id) {
          console.error("❌ SavedContentPage: Utilisateur non authentifié lors du rafraîchissement");
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Veuillez vous reconnecter pour accéder à vos contenus."
          });
          return Promise.reject("Non authentifié");
        }
        
        console.log("🧹 SavedContentPage: Invalidation du cache avant rafraîchissement manuel");
        invalidateCache();
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
        fetchFailuresRef.current += 1;
        
        if (fetchFailuresRef.current > 2) {
          toast({
            variant: "destructive",
            title: "Problème de connexion",
            description: "Veuillez vous reconnecter pour résoudre le problème."
          });
        }
        
        return Promise.reject(error);
      }
    }
    return Promise.resolve();
  }, [fetchContent, isRefreshing, toast, stableContent.length, invalidateCache, forceRefresh, user]);

  const handleItemSelect = useCallback((item: SavedContent) => {
    setSelectedContent(item);
    setIsPreviewOpen(true);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    if (stableContent.length === 0 && !isLoading && !isRefreshing) {
      console.log(`🔄 Onglet changé vers ${tab}, rafraîchissement des données...`);
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
    if (!user || !user.id) {
      console.error("❌ Utilisateur non authentifié lors de la suppression");
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Veuillez vous reconnecter pour supprimer des contenus."
      });
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
      return;
    }
    
    const item = stableContent.find(item => item.id === deleteDialog.itemId);
    if (item) {
      await handleDelete(deleteDialog.itemId, item.type);
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
    }
  }, [deleteDialog.itemId, stableContent, handleDelete, toast, user]);

  // Cleanup resources only on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 SavedContentPage: Nettoyage lors du démontage");
      
      if (loadingTimeoutRef.current) {
        clearInterval(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      
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
    handleTabChange,
    handlePreviewOpenChange,
    handleDeleteRequest,
    handleDeleteDialogChange,
    handleConfirmDelete,
    handleRefresh,
    
    // Status
    hasError: !!(errors.exercises || errors.lessonPlans || errors.correspondences),
    errorMessage: errors.exercises || errors.lessonPlans || errors.correspondences || "",
    authReady
  };
}
