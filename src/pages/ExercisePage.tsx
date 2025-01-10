import React, { useState } from 'react';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { BackButton } from "@/components/settings/BackButton";
import { ResultDisplay } from '@/components/exercise/ResultDisplay';
import { useExerciseGeneration } from '@/hooks/useExerciseGeneration';
import type { ExerciseFormData } from '@/hooks/useExerciseGeneration';

const ExercisePage = () => {
  const { exercises, isLoading, generateExercises } = useExerciseGeneration();
  const [formData, setFormData] = useState<ExerciseFormData>({
    subject: '',
    classLevel: '',
    numberOfExercises: '',
    objective: '',
    exerciseType: '',
    additionalInstructions: '',
    specificNeeds: '',
    strengths: '',
    challenges: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    await generateExercises(formData);
  };

  return (
    <div className="container mx-auto py-8">
      <BackButton />
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
          Générateur d'exercices
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Créez facilement des exercices adaptés à vos besoins et objectifs d'apprentissage.
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ExerciseForm 
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
          />
          {exercises && (
            <div className="xl:sticky xl:top-8">
              <ResultDisplay exercises={exercises} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisePage;