
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import type { SavedContent } from "@/types/saved-content";

export function useImageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const saveImage = async (params: {
    prompt: string;
    image_url?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Créer d'abord l'enregistrement avec le statut 'pending'
      const { data: record, error: insertError } = await supabase
        .from('image_generation_usage')
        .insert([{
          prompt: params.prompt,
          user_id: user.id,
          status: 'pending',
          generated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      if (params.image_url) {
        // Mettre à jour l'enregistrement avec l'URL de l'image
        const { error: updateError } = await supabase
          .from('image_generation_usage')
          .update({ 
            image_url: params.image_url,
            status: 'success'
          })
          .eq('id', record.id);

        if (updateError) throw updateError;

        toast({
          description: "Image sauvegardée avec succès",
        });
      }

      return record;
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde"
      });
      throw error;
    }
  };

  const getSavedImages = async () => {
    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: images, error } = await supabase
        .from('image_generation_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'success')
        .order('generated_at', { ascending: false });

      if (error) throw error;

      return images.map(img => ({
        id: img.id,
        title: img.prompt,
        content: img.image_url,
        created_at: img.generated_at,
        type: 'Image' as const,
        displayType: 'Image',
        tags: [{
          label: 'Image',
          color: '#F2FCE2',
          backgroundColor: '#F2FCE220',
          borderColor: '#F2FCE24D'
        }]
      })) as SavedContent[];
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des images"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveImage,
    getSavedImages
  };
}
