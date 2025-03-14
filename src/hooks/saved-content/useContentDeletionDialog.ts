
import { useState, useCallback } from "react";
import type { SavedContent } from "@/types/saved-content";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for managing content deletion dialog
 * @returns State and handlers for deletion dialog
 */
export function useContentDeletionDialog(onDeleteAction: (id: string, type: string) => Promise<void>) {
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    itemId: string;
    itemType: string;
  }>({
    isOpen: false,
    itemId: "",
    itemType: ""
  });
  
  const { toast } = useToast();

  const handleDeleteRequest = useCallback((content: SavedContent) => {
    setDeleteDialog({
      isOpen: true,
      itemId: content.id,
      itemType: content.displayType || ""
    });
  }, []);

  const handleDeleteDialogChange = useCallback((isOpen: boolean) => {
    setDeleteDialog(prev => ({ ...prev, isOpen }));
  }, []);

  const handleConfirmDelete = useCallback(async (userId?: string) => {
    if (!userId) {
      console.error("❌ Utilisateur non authentifié lors de la suppression");
      toast({
        variant: "destructive",
        title: "Erreur d'authentification",
        description: "Veuillez vous reconnecter pour supprimer des contenus."
      });
      setDeleteDialog(prev => ({ ...prev, isOpen: false }));
      return;
    }
    
    await onDeleteAction(deleteDialog.itemId, deleteDialog.itemType);
    setDeleteDialog(prev => ({ ...prev, isOpen: false }));
  }, [deleteDialog.itemId, deleteDialog.itemType, onDeleteAction, toast]);

  return {
    deleteDialog,
    handleDeleteRequest,
    handleDeleteDialogChange,
    handleConfirmDelete
  };
}
