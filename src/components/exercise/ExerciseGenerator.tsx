import React, { useState } from 'react';
import { ExerciseForm } from './ExerciseForm';
import { ResultDisplay } from './ResultDisplay';
import { useExerciseGeneration } from '@/hooks/useExerciseGeneration';
import type { ExerciseFormData } from '@/hooks/useExerciseGeneration';

export function ExerciseGenerator() {
  const { exercises, isLoading, generateExercises } = useExerciseGeneration();
  const [formData, setFormData] = useState<ExerciseFormData>({
    subject: "",
    classLevel: "",
    numberOfExercises: "3",
    objective: "",
    exerciseType: "",
    additionalInstructions: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-orange-50 to-purple-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-none mx-auto flex flex-col items-center">
          <div className="w-full max-w-[1200px]">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 bg-clip-text text-transparent">
                Générateur d'exercices
              </h1>
              <p className="mt-2 text-gray-600">
                Créez des exercices adaptés à vos besoins pédagogiques en quelques clics.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200">
                  <ExerciseForm 
                    formData={formData} 
                    handleInputChange={handleInputChange}
                    handleSubmit={() => generateExercises(formData)}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              <div className="xl:sticky xl:top-8 space-y-6">
                <ResultDisplay exercises={exercises} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}