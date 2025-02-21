
import React, { useState } from 'react';
import { useExerciseGeneration, ExerciseFormData } from "@/hooks/useExerciseGeneration";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { ResultDisplay } from "@/components/exercise/ResultDisplay";

export default function ExercisePage() {
  const [exercises, setExercises] = useState<string | null>(null);
  const { generateExercises, isLoading } = useExerciseGeneration();
  
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

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Générateur d'Exercices</h1>
      <ExerciseForm 
        formData={formData}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
      <div className="mt-10">
        <ResultDisplay exercises={exercises} />
      </div>
    </div>
  );
}
