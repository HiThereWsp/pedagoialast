import { useState, useEffect, useCallback, useRef } from "react";
import type { SavedContent } from "@/types/saved-content";
import { useSavedContentManagement } from "./useSavedContentManagement";
import { useStableContent } from "./useStableContent";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useSavedContentPage() {
  // États UI
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
  
  // Références pour suivi interne
  const hasInitializedRef = useRef(false);
  const { toast } = useToast();
  const { user, authReady } = useAuth();

  // États de contenu et gestion
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

  // Mettre à jour le contenu stable quand le contenu change
  useEffect(() => {
    console.log("🔄 Effet de mise à jour du contenu:", {
      contentLength: content.length,
      stableContentLength: stableContent.length
    });
    
    // Toujours mettre à jour le contenu stable s'il y a des données
    if (content) {
      updateContent(content);
    }
  }, [content, updateContent]);

  // Logique de chargement simplifiée
  useEffect(() => {
    const loadInitialData = async () => {
      // Vérifier que l'authentification est prête et l'utilisateur connecté
      if (!authReady || !user || hasInitializedRef.current) {
        return;
      }
      
      console.log("📥 Chargement initial des données...");
      hasInitializedRef.current = true;
      
      try {
        // Un seul appel à fetchContent pour éviter les cycles de rechargement
        const data = await fetchContent();
        console.log(`✅ Chargement initial terminé: ${data.length} éléments chargés`);
        
        // Ne pas forcer de rechargement si des données sont trouvées
        if (data.length === 0) {
          // Message informatif plus simple
          toast({
            description: "Aucun contenu trouvé. Créez votre premier contenu !",
          });
        }
      } catch (err) {
        console.error("❌ Erreur lors du chargement initial:", err);
        toast({
          variant: "destructive",
          title: "Erreur de chargement",
          description: "Impossible de charger vos contenus. Veuillez réessayer."
        });
      }
    };
    
    loadInitialData();
  }, [fetchContent, toast, authReady, user, invalidateCache]);

  // Fonction de rafraîchissement optimisée
  const handleRefresh = useCallback(async (): Promise<void> => {
    if (isRefreshing) return Promise.resolve();
    
    try {
      console.log("🔄 Lancement du rafraîchissement manuel...");
      
      if (!user?.id) {
        console.error("❌ Utilisateur non authentifié lors du rafraîchissement");
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter pour accéder à vos contenus."
        });
        return Promise.reject("Non authentifié");
      }
      
      console.log("🧹 Forçage du rafraîchissement des données");
      forceRefresh(); // Force le rafraîchissement du contenu stable
      invalidateCache();
      
      const refreshedContent = await fetchContent();
      console.log(`✅ Rafraîchissement terminé: ${refreshedContent.length} éléments`);
      
      return Promise.resolve();
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement:", error);
      toast({
        variant: "destructive",
        title: "Problème de connexion",
        description: "Impossible de rafraîchir vos contenus. Veuillez réessayer."
      });
      return Promise.reject(error);
    }
  }, [fetchContent, isRefreshing, toast, invalidateCache, user, forceRefresh]);

  // Gestionnaires d'événements simplifiés
  const handleItemSelect = useCallback((item: SavedContent) => {
    setSelectedContent(item);
    setIsPreviewOpen(true);
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    // Ne rafraîchir que si nécessaire (contenu vide ou changement d'onglet)
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

  // Nettoyage uniquement lors du démontage
  useEffect(() => {
    return () => {
      console.log("🧹 Nettoyage lors du démontage");
      if (cleanup) {
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
