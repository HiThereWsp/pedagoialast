
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { SavedContent } from "@/types/saved-content";

export function useCorrespondenceContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveCorrespondence = async (params: {
    title: string;
    content: string;
    recipient_type: string;
    tone?: string;
  }) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('saved_correspondences')
        .insert([{
          ...params,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Correspondance sauvegardée",
        description: "Votre correspondance a été sauvegardée avec succès"
      });

      return data;
    } catch (error) {
      console.error('Error saving correspondence:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSavedCorrespondences = async () => {
    try {
      setIsLoading(true);
      const { data: correspondences, error } = await supabase
        .from('saved_correspondences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Ajouter des logs pour vérifier les correspondances récupérées
      console.log(`${correspondences?.length || 0} correspondances récupérées`);

      return correspondences.map(correspondence => ({
        id: correspondence.id,
        title: correspondence.title,
        content: correspondence.content,
        created_at: correspondence.created_at,
        type: 'correspondence' as const, // S'assurer que le type est défini correctement
        displayType: 'Correspondance',
        tags: [{
          label: 'Correspondance',
          color: '#9b87f5',
          backgroundColor: '#9b87f520',
          borderColor: '#9b87f54D'
        }]
      })) as SavedContent[];
    } catch (error) {
      console.error('Error fetching correspondences:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSavedCorrespondence = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('saved_correspondences')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Correspondance supprimée",
        description: "Votre correspondance a été supprimée avec succès"
      });
    } catch (error) {
      console.error('Error deleting correspondence:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveCorrespondence,
    getSavedCorrespondences,
    deleteSavedCorrespondence
  };
}
