import React, { useState } from 'react';
import { ExerciseForm } from './ExerciseForm';
import { ResultDisplay } from './ResultDisplay';
import { useExerciseGeneration } from '@/hooks/useExerciseGeneration';
import type { ExerciseFormData } from '@/hooks/useExerciseGeneration';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function ExerciseGenerator() {
  const { exercises, isLoading, generateExercises } = useExerciseGeneration();
  const [isFormExpanded, setIsFormExpanded] = useState(true);
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

  const handleGenerateExercises = async () => {
    await generateExercises(formData);
    setIsFormExpanded(false);
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
                <Collapsible
                  open={isFormExpanded}
                  onOpenChange={setIsFormExpanded}
                  className="bg-white rounded-xl shadow-sm border border-pink-100 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Paramètres
                    </h2>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm">
                        {isFormExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                  
                  <CollapsibleContent>
                    <ExerciseForm 
                      formData={formData} 
                      handleInputChange={handleInputChange}
                      handleSubmit={handleGenerateExercises}
                      isLoading={isLoading}
                    />
                  </CollapsibleContent>

                  {!isFormExpanded && (
                    <Button
                      onClick={() => setIsFormExpanded(true)}
                      className="w-full bg-gradient-to-r from-[#F97316] via-[#D946EF] to-pink-500 hover:from-pink-500 hover:via-[#D946EF] hover:to-[#F97316] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow mt-4"
                    >
                      Générer de nouveaux exercices
                    </Button>
                  )}
                </Collapsible>
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