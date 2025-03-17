
import { useState, useEffect } from "react";
import { useExerciseGeneration } from "./useExerciseGeneration";
import type { ExerciseFormData } from "@/types/saved-content";

// Default form data
export const defaultFormData: ExerciseFormData = {
  subject: "",
  classLevel: "",
  numberOfExercises: "",
  questionsPerExercise: "",
  objective: "",
  exerciseType: "",
  additionalInstructions: "",
  specificNeeds: "",
  originalExercise: "",
  studentProfile: "",
  learningDifficulties: "",
  selectedLessonPlan: "",
  challenges: ""
};

export function useExercisePageState() {
  const { 
    generateExercises, 
    isLoading, 
    isSaving,
    lastSaveError,
    getExerciseCacheState,
    clearExerciseCache,
    retrySaveExercise,
    lastGeneratedId
  } = useExerciseGeneration();
  
  const [exercises, setExercises] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"create" | "differentiate">("create");
  const [formData, setFormData] = useState<ExerciseFormData>(defaultFormData);
  const [isCachedDataLoaded, setIsCachedDataLoaded] = useState(false);

  // Load cached data on initial render
  useEffect(() => {
    console.log('Chargement initial des données du cache...');
    const cacheState = getExerciseCacheState();
    
    if (cacheState.formData) {
      console.log('Données de formulaire trouvées dans le cache');
      setFormData({
        ...defaultFormData,
        ...cacheState.formData
      });
    }
    
    if (cacheState.exerciseResult) {
      console.log('Résultat d\'exercice trouvé dans le cache');
      setExercises(cacheState.exerciseResult);
    }
    
    if (cacheState.activeTab) {
      console.log('Onglet actif trouvé dans le cache:', cacheState.activeTab);
      setActiveTab(cacheState.activeTab);
    }
    
    setIsCachedDataLoaded(true);
  }, [getExerciseCacheState]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Soumission du formulaire, génération d\'exercice...');
    
    // Keep current result only if generation fails
    const currentExercises = exercises;
    
    // Reset exercises to avoid visual persistence
    setExercises("");
    
    const result = await generateExercises(formData, activeTab === "differentiate");
    
    if (result) {
      console.log('Exercice généré avec succès, mise à jour de l\'affichage');
      setExercises(result);
    } else {
      // If error, restore previous state
      console.log('Échec de la génération, restauration de l\'état précédent');
      setExercises(currentExercises);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === activeTab) return;
    
    console.log('Changement d\'onglet:', tab);
    setActiveTab(tab as "create" | "differentiate");
    
    // Clear exercises on tab change to avoid confusion
    setExercises("");
    
    // Reset form fields specific to each tab
    if (tab === "create") {
      setFormData(prev => ({
        ...prev,
        originalExercise: "",
        studentProfile: "",
        learningDifficulties: "",
        challenges: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        objective: ""
      }));
    }
  };

  // Function to retry saving
  const handleRetrySave = async () => {
    if (exercises) {
      await retrySaveExercise(formData, exercises, activeTab === "differentiate");
    }
  };

  return {
    exercises,
    activeTab,
    formData,
    isLoading,
    isSaving,
    lastSaveError,
    lastGeneratedId,
    handleInputChange,
    handleSubmit,
    handleTabChange,
    handleRetrySave,
    isCachedDataLoaded
  };
}
