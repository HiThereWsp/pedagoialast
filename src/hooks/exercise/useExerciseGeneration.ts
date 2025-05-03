import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import type { ExerciseFormData } from '@/types/saved-content';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';

const LOCALSTORAGE_FORM_KEY = 'pedagoia-exercise-form';
const LOCALSTORAGE_RESULT_KEY = 'pedagoia-exercise-result';
const LOCALSTORAGE_TAB_KEY = 'pedagoia-exercise-tab';
const LOCALSTORAGE_ID_KEY = 'pedagoia-exercise-id';

type SaveState = {
  id: string;
  status: 'pending' | 'failed' | 'success';
  error?: string;
};

export function useExerciseGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false); 
  const [lastSaveState, setLastSaveState] = useState<SaveState | null>(null);
  const [lastGeneratedId, setLastGeneratedId] = useState<string | null>(null);

  // Gets the current cached state
  const getExerciseCacheState = useCallback(() => {
    const cachedFormData = localStorage.getItem(LOCALSTORAGE_FORM_KEY);
    const cachedExerciseResult = localStorage.getItem(LOCALSTORAGE_RESULT_KEY);
    const cachedTabSelection = localStorage.getItem(LOCALSTORAGE_TAB_KEY);
    const cachedExerciseId = localStorage.getItem(LOCALSTORAGE_ID_KEY);

    return {
      formData: cachedFormData ? JSON.parse(cachedFormData) : null,
      exerciseResult: cachedExerciseResult || null,
      activeTab: cachedTabSelection as "create" | "differentiate" || "create",
      exerciseId: cachedExerciseId || null,
    };
  }, []);

  // Clears the exercise cache
  const clearExerciseCache = useCallback(() => {
    localStorage.removeItem(LOCALSTORAGE_FORM_KEY);
    localStorage.removeItem(LOCALSTORAGE_RESULT_KEY);
    localStorage.removeItem(LOCALSTORAGE_TAB_KEY);
    localStorage.removeItem(LOCALSTORAGE_ID_KEY);
    setLastGeneratedId(null);
  }, []);

  // Updates cache with latest form and result data
  const updateCache = useCallback((
    formData: ExerciseFormData, 
    exerciseResult: string, 
    activeTab: "create" | "differentiate",
    exerciseId: string
  ) => {
    localStorage.setItem(LOCALSTORAGE_FORM_KEY, JSON.stringify(formData));
    localStorage.setItem(LOCALSTORAGE_RESULT_KEY, exerciseResult);
    localStorage.setItem(LOCALSTORAGE_TAB_KEY, activeTab);
    localStorage.setItem(LOCALSTORAGE_ID_KEY, exerciseId);
    setLastGeneratedId(exerciseId);
  }, []);

  // API call to generate exercises
  const generateExercises = async (formData: ExerciseFormData, isDifferentiation: boolean) => {
    setIsLoading(true);
    try {
      console.log('Envoi de la requête de génération à la fonction Edge...');
      
      const functionName = isDifferentiation ? 'generate-exercises' : 'generate-exercises';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          ...formData,
          isDifferentiation,
        },
      });
      
      if (error) {
        console.error('Erreur Edge Function:', error);
        throw new Error(error.message || 'Une erreur est survenue lors de la génération');
      }
      
      console.log('Réponse de la fonction Edge reçue:', data);
      
      // Generate an ID for this exercise
      const exerciseId = uuidv4();
      
      // Save to local storage
      updateCache(formData, data.exercises, isDifferentiation ? "differentiate" : "create", exerciseId);
      
      // Attempt to save to database
      saveExercise(formData, data.exercises, isDifferentiation, exerciseId);
      
      return data.exercises;
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la génération de l'exercice",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // API call to modify existing exercises
  const modifyExercises = async (
    formData: ExerciseFormData, 
    currentExercises: string, 
    modificationInstructions: string,
    isDifferentiation: boolean
  ) => {
    setIsModifying(true);
    try {
      console.log('Envoi de la requête de modification à la fonction Edge...');
      
      const { data, error } = await supabase.functions.invoke('modify-exercise', {
        body: {
          ...formData,
          exercise_content: currentExercises,
          modification_instructions: modificationInstructions,
          isDifferentiation
        },
      });
      
      if (error) {
        console.error('Erreur Edge Function de modification:', error);
        throw new Error(error.message || 'Une erreur est survenue lors de la modification');
      }
      
      console.log('Réponse de la fonction Edge de modification reçue:', data);
      
      // Récupérer l'ID existant
      const exerciseId = localStorage.getItem(LOCALSTORAGE_ID_KEY) || uuidv4();
      
      // Sauvegarder les modifications dans le stockage local
      updateCache(formData, data.exercises, isDifferentiation ? "differentiate" : "create", exerciseId);
      
      // Tenter de sauvegarder dans la base de données
      saveExercise(formData, data.exercises, isDifferentiation, exerciseId);
      
      return data.exercises;
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        variant: "destructive",
        title: "Erreur de modification",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la modification de l'exercice",
      });
      return null;
    } finally {
      setIsModifying(false);
    }
  };

  // Save exercise to database
  const saveExercise = async (
    formData: ExerciseFormData, 
    content: string, 
    isDifferentiation: boolean,
    exerciseId: string
  ) => {
    setIsSaving(true);
    setLastSaveState({
      id: exerciseId,
      status: 'pending'
    });
    
    try {
      console.log('Sauvegarde de l\'exercice dans la base de données...');
      
      const { error } = await supabase
        .from('saved_exercises')
        .upsert({
          id: exerciseId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          form_data: formData,
          content: content,
          type: isDifferentiation ? "differentiated" : "standard",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        throw new Error(error.message || 'Erreur lors de la sauvegarde');
      }
      
      console.log('Exercice sauvegardé avec succès');
      setLastSaveState({
        id: exerciseId,
        status: 'success'
      });
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
      setLastSaveState({
        id: exerciseId,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Retry saving the last generated exercise
  const retrySaveExercise = async (
    formData: ExerciseFormData, 
    content: string, 
    isDifferentiation: boolean
  ) => {
    if (!lastSaveState || lastSaveState.status !== 'failed') return;
    
    // Retry with the same ID
    await saveExercise(formData, content, isDifferentiation, lastSaveState.id);
  };

  return {
    isLoading,
    isModifying,
    isSaving,
    generateExercises,
    modifyExercises,
    lastSaveError: lastSaveState?.status === 'failed' ? lastSaveState.error : null,
    lastGeneratedId,
    getExerciseCacheState,
    clearExerciseCache,
    retrySaveExercise
  };
}
