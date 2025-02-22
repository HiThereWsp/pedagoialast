import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';

export interface ExerciseFormData {
  subject: string;
  classLevel: string;
  numberOfExercises: string;
  questionsPerExercise: string;
  objective: string;
  exerciseType: string;
  additionalInstructions: string;
  specificNeeds: string;
  originalExercise: string;
  studentProfile: string;
  learningDifficulties: string;
  selectedLessonPlan?: string;
}

export function useExerciseGeneration() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const [isLoading, setIsLoading] = useState(false);

  const generateExercises = useCallback(async (formData: ExerciseFormData, isDifferentiation: boolean = false) => {
    if (!formData.subject || !formData.classLevel || !formData.objective) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires."
      });
      return null;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-exercises', {
        body: {
          ...formData,
          isDifferentiation
        }
      });

      if (functionError) throw functionError;

      const generationTime = Math.round(performance.now() - startTime);
      await logToolUsage('exercise', 'generate', functionData?.exercises?.length || 0, generationTime);

      toast({
        description: "🎉 Vos exercices ont été générés avec succès !"
      });

      return functionData?.exercises || "";

    } catch (error) {
      console.error('Error generating exercises:', error);
      toast({
        variant: "destructive",
        description: "Une erreur est survenue lors de la génération des exercices."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast, logToolUsage]);

  return {
    isLoading,
    generateExercises
  };
}

import { SEO } from "@/components/SEO";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { ResultDisplay } from "@/components/exercise/ResultDisplay";
import { useExerciseGeneration } from "@/hooks/useExerciseGeneration";
import { Link } from "react-router-dom";
import { Tiles } from "@/components/ui/tiles";
import { useState } from "react";

export default function ExercisePage() {
  const { generateExercises, isLoading } = useExerciseGeneration();
  const [exercises, setExercises] = useState<string>("");
  const [formData, setFormData] = useState<ExerciseFormData>({
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
    challenges: [] as string[]
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    const result = await generateExercises(formData);
    if (result) {
      setExercises(result);
    }
  };

  return (
    <>
      <SEO
        title="Générateur d'exercices | PedagoIA"
        description="Créez des exercices personnalisés pour vos élèves"
      />
      <div className="relative min-h-screen">
        <div className="fixed inset-0 overflow-hidden">
          <Tiles
            rows={50}
            cols={8}
            tileSize="md"
            className="opacity-30"
          />
        </div>
        <div className="container relative z-10 mx-auto px-4 py-8">
          <Link to="/home" className="block mb-8">
            <img
              src="/lovable-uploads/93d432b8-78fb-4807-ba55-719b6b6dc7ef.png"
              alt="PedagoIA Logo"
              className="w-[100px] h-[120px] object-contain mx-auto hover:scale-105 transition-transform duration-200"
            />
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Générateur d'exercices
            </h1>
            <p className="text-muted-foreground">
              Créez des exercices adaptés à vos besoins pédagogiques
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ExerciseForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
            <ResultDisplay exercises={exercises} />
          </div>
        </div>
      </div>
    </>
  );
}
