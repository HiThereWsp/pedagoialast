
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { ResultDisplay } from "@/components/exercise/ResultDisplay";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { exercisesService } from "@/services/exercises";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { SaveExerciseParams } from "@/types/saved-content";

export default function ExercisePage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    subject: '',
    classLevel: '',
    numberOfExercises: '',
    questionsPerExercise: '',
    objective: '',
    exerciseType: '',
    additionalInstructions: '',
    specificNeeds: '',
    challenges: '',
    originalExercise: '',
    studentProfile: '',
    learningDifficulties: '',
    selectedLessonPlan: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      console.log("Submitting form data:", formData);

      const { data, error } = await supabase.functions.invoke('generate-exercises', {
        body: formData,
      });

      console.log("Response from generate-exercises:", data);

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error('Erreur lors de la génération des exercices');
      }

      if (!data?.exercises) {
        console.error("No exercises in response:", data);
        throw new Error('Aucun exercice n\'a été généré');
      }

      setGeneratedContent(data.exercises);
      
      toast({
        title: "Succès !",
        description: "Les exercices ont été générés avec succès.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération des exercices.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    try {
      setIsSaving(true);
      
      // Formatage des données selon SaveExerciseParams
      const saveParams: SaveExerciseParams = {
        title: `Exercices de ${formData.subject} - ${formData.classLevel}`,
        content: generatedContent,
        subject: formData.subject,
        class_level: formData.classLevel,
        exercise_type: formData.exerciseType || undefined,
        exercise_category: 'standard' as const,
        student_profile: formData.studentProfile || undefined,
        specific_needs: formData.specificNeeds || undefined
      };

      await exercisesService.save(saveParams);
      
      toast({
        title: "Sauvegardé !",
        description: "Les exercices ont été sauvegardés avec succès.",
      });
    } catch (error) {
      console.error("Error saving exercises:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des exercices.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <SEO 
        title="Générateur d'exercices | PedagoIA - Création d'exercices différenciés" 
        description="Créez des exercices différenciés et adaptés à vos élèves avec notre assistant intelligent."
      />
      <div className="container mx-auto py-8">
        <Link to="/home" className="block mb-8">
          <img 
            src="/lovable-uploads/93d432b8-78fb-4807-ba55-719b6b6dc7ef.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto hover:scale-105 transition-transform duration-200" 
          />
        </Link>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#9b87f5] to-[#6E59A5] bg-clip-text text-transparent">
            Générateur d'exercices
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Créez des exercices différenciés et adaptés à vos élèves en quelques clics.
          </p>
        </div>
        <ExerciseForm 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
        />
        {generatedContent && (
          <div className="mt-8">
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Sauvegarde..." : "Sauvegarder les exercices"}
              </Button>
            </div>
            <ResultDisplay exercises={generatedContent} />
          </div>
        )}
      </div>
    </>
  );
}
