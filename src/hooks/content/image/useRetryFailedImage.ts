
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { getAuthenticatedUser } from './imageContentUtils';

/**
 * Hook for retrying failed image generations
 * @returns Function to retry failed image generation
 */
export function useRetryFailedImage() {
  const { toast } = useToast();

  const retryFailedImage = async (recordId: string): Promise<boolean> => {
    try {
      const user = await getAuthenticatedUser();
      if (!user) {
        console.error('Utilisateur non authentifié lors de la nouvelle tentative');
        return false;
      }
      
      const { data: record, error: fetchError } = await supabase
        .from('image_generation_usage')
        .select('*')
        .eq('id', recordId)
        .eq('user_id', user.id) // Vérifier que l'image appartient à l'utilisateur
        .single();

      if (fetchError || !record) {
        console.error('Erreur ou image non trouvée:', fetchError);
        return false;
      }

      const currentRetryCount = record.retry_count || 0;
      if (currentRetryCount >= 3) {
        console.log('Nombre maximal de tentatives atteint');
        return false;
      }

      const { error: updateError } = await supabase
        .from('image_generation_usage')
        .update({
          status: 'processing',
          retry_count: currentRetryCount + 1,
          last_retry: new Date().toISOString()
        })
        .eq('id', recordId)
        .eq('user_id', user.id); // S'assurer que l'image appartient à l'utilisateur

      if (updateError) {
        console.error('Erreur lors de la mise à jour de l\'image:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la nouvelle tentative de génération d\'image:', error);
      return false;
    }
  };

  return { retryFailedImage };
}
