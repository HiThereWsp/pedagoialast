
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { ExerciseForm } from "@/components/exercise/ExerciseForm";
import { ResultDisplay } from "@/components/exercise/ResultDisplay";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";

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

      // Appel à la fonction Edge generate-exercises
      const response = await fetch('/api/generate-exercises', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération des exercices');
      }

      const data = await response.json();
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
            <ResultDisplay content={generatedContent} />
          </div>
        )}
      </div>
    </>
  );
}
