import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { exercisesService } from "@/services/exercises";
import { lessonPlansService } from "@/services/lesson-plans";
import type { SaveExerciseParams, SaveLessonPlanParams, SavedContent } from "@/types/saved-content";
import { exerciseCategories } from "@/components/saved-content/CarouselCategories";
import { supabase } from '@/integrations/supabase/client';

export function useSavedContent() {
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isLoadingLessonPlans, setIsLoadingLessonPlans] = useState(false);
  const [isLoadingCorrespondences, setIsLoadingCorrespondences] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const { toast } = useToast();

  const saveImage = async (params: {
    prompt: string;
    image_url: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('image_generation_usage')
        .insert([{
          prompt: params.prompt,
          image_url: params.image_url,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      return data;
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

  const saveExercise = async (params: SaveExerciseParams) => {
    try {
      setIsLoadingExercises(true);
      await exercisesService.save(params);
      toast({
        title: "Exercice sauvegardé",
        description: "Votre exercice a été sauvegardé avec succès"
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Limite de contenu')) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous avez atteint la limite de contenu sauvegardé"
        });
      } else {
        console.error('Error saving exercise:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la sauvegarde"
        });
      }
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const saveLessonPlan = async (params: SaveLessonPlanParams) => {
    try {
      setIsLoadingLessonPlans(true);
      await lessonPlansService.save(params);
      toast({
        title: "Séquence sauvegardée",
        description: "Votre séquence a été sauvegardée avec succès"
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Limite de contenu')) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous avez atteint la limite de contenu sauvegardé"
        });
      } else {
        console.error('Error saving lesson plan:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la sauvegarde"
        });
      }
    } finally {
      setIsLoadingLessonPlans(false);
    }
  };

  const saveCorrespondence = async (params: {
    title: string;
    content: string;
    recipient_type: string;
    tone?: string;
  }) => {
    try {
      setIsLoadingCorrespondences(true);
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
      setIsLoadingCorrespondences(false);
    }
  };

  const getSavedExercises = async () => {
    try {
      setIsLoadingExercises(true);
      const exercises = await exercisesService.getAll();
      return exercises.map(exercise => ({
        ...exercise,
        type: 'exercise' as const,
        displayType: 'Exercice',
        tags: [
          {
            label: (exercise as any).exercise_category === 'differentiated' 
              ? exerciseCategories.differentiated.label 
              : exerciseCategories.standard.label,
            ...(exerciseCategories[(exercise as any).exercise_category || 'standard'])
          }
        ]
      })) as SavedContent[];
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const getSavedLessonPlans = async () => {
    try {
      setIsLoadingLessonPlans(true);
      return await lessonPlansService.getAll();
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      throw error;
    } finally {
      setIsLoadingLessonPlans(false);
    }
  };

  const getSavedCorrespondences = async () => {
    try {
      setIsLoadingCorrespondences(true);
      const { data: correspondences, error } = await supabase
        .from('saved_correspondences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return correspondences.map(correspondence => ({
        id: correspondence.id,
        title: correspondence.title,
        content: correspondence.content,
        created_at: correspondence.created_at,
        type: 'correspondence' as const,
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
      setIsLoadingCorrespondences(false);
    }
  };

  const getSavedImages = async () => {
    try {
      setIsLoadingImages(true);
      const { data: images, error } = await supabase
        .from('image_generation_usage')
        .select('*')
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
      throw error;
    } finally {
      setIsLoadingImages(false);
    }
  };

  const deleteSavedExercise = async (id: string) => {
    try {
      setIsLoadingExercises(true);
      await exercisesService.delete(id);
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const deleteSavedLessonPlan = async (id: string) => {
    try {
      setIsLoadingLessonPlans(true);
      await lessonPlansService.delete(id);
    } catch (error) {
      console.error('Error deleting lesson plan:', error);
      throw error;
    } finally {
      setIsLoadingLessonPlans(false);
    }
  };

  const deleteSavedCorrespondence = async (id: string) => {
    try {
      setIsLoadingCorrespondences(true);
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
      setIsLoadingCorrespondences(false);
    }
  };

  return {
    isLoadingExercises,
    isLoadingLessonPlans,
    isLoadingCorrespondences,
    isLoadingImages,
    saveExercise,
    saveLessonPlan,
    saveCorrespondence,
    getSavedExercises,
    getSavedLessonPlans,
    getSavedCorrespondences,
    getSavedImages,
    deleteSavedExercise,
    deleteSavedLessonPlan,
    deleteSavedCorrespondence,
    saveImage,
  };
}
