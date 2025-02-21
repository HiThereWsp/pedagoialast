
import React, { useState, useEffect } from 'react';
import { useExerciseGeneration, ExerciseFormData } from "@/hooks/useExerciseGeneration";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { ResultDisplay } from "@/components/exercise/ResultDisplay";
import { useSavedContent } from "@/hooks/useSavedContent";
import { HistoryCarousel } from "@/components/history/HistoryCarousel";
import type { SavedContent } from "@/types/saved-content";
import { useToast } from "@/hooks/use-toast";

export default function ExercisePage() {
  const [exercises, setExercises] = useState<string | null>(null);
  const [savedExercises, setSavedExercises] = useState<SavedContent[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<SavedContent | null>(null);
  const { generateExercises, isLoading } = useExerciseGeneration();
  const { getSavedExercises, isLoadingExercises } = useSavedContent();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<ExerciseFormData>({
    subject: '',
    classLevel: '',
    numberOfExercises: '1',
    questionsPerExercise: '5',
    objective: '',
    exerciseType: '',
    additionalInstructions: '',
    specificNeeds: '',
    challenges: '',
    originalExercise: '',
    studentProfile: '',
    learningDifficulties: '',
  });

  useEffect(() => {
    const fetchSavedExercises = async () => {
      try {
        const exercises = await getSavedExercises();
        if (Array.isArray(exercises)) {
          setSavedExercises(exercises);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des exercices:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des exercices",
          variant: "destructive",
        });
      }
    };

    fetchSavedExercises();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    console.log("Updating field:", field, "with value:", value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    console.log("Submitting form with data:", formData);
    try {
      const result = await generateExercises(formData);
      if (result) {
        setExercises(result);
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    }
  };

  const handleExerciseSelect = (exercise: SavedContent) => {
    setSelectedExercise(exercise);
    // Pré-remplir le formulaire avec les données de l'exercice sélectionné
    setFormData(prev => ({
      ...prev,
      subject: exercise.subject || '',
      classLevel: exercise.class_level || '',
      objective: exercise.content || ''
    }));
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">Générateur d'Exercices</h1>
      
      {/* Section Historique */}
      <div className="mb-8">
        <HistoryCarousel 
          items={savedExercises}
          onItemSelect={handleExerciseSelect}
          selectedItemId={selectedExercise?.id}
        />
      </div>

      {/* Formulaire de génération */}
      <ExerciseForm 
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* Affichage des résultats */}
      <div className="mt-10">
        <ResultDisplay exercises={exercises} />
      </div>
    </div>
  );
}
