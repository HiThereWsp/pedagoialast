import React, { useState } from 'react';
import { useExerciseGeneration, ExerciseFormData } from "@/hooks/useExerciseGeneration";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { ResultDisplay } from "@/components/exercise/ResultDisplay";

export default function ExercisePage() {
  const [exercises, setExercises] = useState<string | null>(null);
  const { generateExercises, isLoading: isGenerating } = useExerciseGeneration();

  const handleSubmit = async (data: ExerciseFormData) => {
    setIsGenerating(true);
    try {
      const result = await generateExercises({
        ...data,
        numberOfExercises: data.numberOfExercises.toString(),
        questionsPerExercise: data.questionsPerExercise.toString()
      });
      if (result) {
        setExercises(result);
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Générateur d'Exercices</h1>
      <ExerciseForm onSubmit={handleSubmit} isLoading={isGenerating} />
      <div className="mt-10">
        <ResultDisplay exercises={exercises} />
      </div>
    </div>
  );
}
