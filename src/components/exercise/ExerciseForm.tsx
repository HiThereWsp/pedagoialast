import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GenerateExerciseForm } from './form/GenerateExerciseForm';
import { DifferentiateExerciseForm } from './form/DifferentiateExerciseForm';
import { FormFields } from './form/FormFields';

interface ExerciseFormProps {
  formData: {
    subject: string;
    classLevel: string;
    numberOfExercises: string;
    questionsPerExercise: string;
    objective: string;
    exerciseType: string;
    additionalInstructions: string;
    specificNeeds: string;
    challenges: string;
    originalExercise: string;
    studentProfile: string;
    learningDifficulties: string;
    selectedLessonPlan?: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function ExerciseForm({ formData, handleInputChange, handleSubmit, isLoading }: ExerciseFormProps) {
  const [isDifferentiation, setIsDifferentiation] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
      <div className="flex justify-center mb-8">
        <Tabs defaultValue={isDifferentiation ? "differentiate" : "generate"} className="w-full max-w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="generate" 
              onClick={() => setIsDifferentiation(false)}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F97316] data-[state=active]:via-[#D946EF] data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Générer
            </TabsTrigger>
            <TabsTrigger 
              value="differentiate" 
              onClick={() => setIsDifferentiation(true)}
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#F97316] data-[state=active]:via-[#D946EF] data-[state=active]:to-pink-500 data-[state=active]:text-white"
            >
              Différencier
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-6">
        {!isDifferentiation && <FormFields.LessonPlanSelect value={formData.selectedLessonPlan || ''} onChange={handleInputChange} />}
        {isDifferentiation ? (
          <DifferentiateExerciseForm formData={formData} handleInputChange={handleInputChange} />
        ) : (
          <GenerateExerciseForm formData={formData} handleInputChange={handleInputChange} />
        )}
      </div>

      <Button
        className="w-full bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow"
        onClick={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="h-5 w-5" />
        )}
        {isLoading 
          ? "Génération en cours..." 
          : isDifferentiation 
            ? "Différencier l'exercice"
            : "Générer les exercices"
        }
      </Button>
    </div>
  );
}
