
import { useCallback } from 'react';
import { useDeleteContent } from './useDeleteContent';
import type { SavedContent } from '@/types/saved-content';

export function useContentDeletion() {
  const { handleDelete, deleteErrors, setDeleteErrors } = useDeleteContent();

  const deleteContent = useCallback(async (id: string, type: SavedContent['type']): Promise<void> => {
    if (!id || !type) {
      console.error("❌ ID ou type manquant pour la suppression");
      return;
    }
    
    console.log(`🗑️ Suppression de contenu demandée: ${id} (type: ${type})`);
    await handleDelete(id, type);
  }, [handleDelete]);

  return {
    deleteContent,
    deleteErrors,
    setDeleteErrors
  };
}
