
import React, { useState } from 'react';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { BackButton } from "@/components/settings/BackButton";
import { ResultDisplay } from '@/components/exercise/ResultDisplay';
import { useExerciseGeneration } from '@/hooks/useExerciseGeneration';
import { useSavedContent } from '@/hooks/useSavedContent';
import { SEO } from "@/components/SEO";

const ExercisePage = () => {
  const { exercises, isLoading, generateExercises } = useExerciseGeneration();
  const { saveExercise } = useSavedContent();
  const [formData, setFormData] = useState({
    subject: '',
    classLevel: '',
    numberOfExercises: '',
    questionsPerExercise: '',
    objective: '',
    exerciseType: '',
    additionalInstructions: '',
    specificNeeds: '',
    strengths: '',
    challenges: '',
    originalExercise: '',
    studentProfile: '',
    learningStyle: '',
    learningDifficulties: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    const result = await generateExercises(formData);
    
    if (result && exercises) {
      // Sauvegarder automatiquement l'exercice généré
      await saveExercise({
        title: `Exercice ${formData.subject || ''} - ${formData.classLevel}`,
        content: exercises,
        subject: formData.subject,
        class_level: formData.classLevel,
        exercise_type: formData.exerciseType,
        difficulty_level: 'standard'
      });
    }
  };

  return (
    <>
      <SEO 
        title="Générateur d'exercices | PedagoIA - Créez des exercices adaptés"
        description="Créez facilement des exercices personnalisés et adaptés à vos besoins pédagogiques avec notre générateur intelligent."
      />
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto mb-4" 
          />
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
            Générateur d'exercices
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Créez facilement des exercices adaptés à vos besoins et objectifs d'apprentissage.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
            <div className="w-full overflow-x-hidden">
              <ExerciseForm 
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>
            {exercises && (
              <div className="xl:sticky xl:top-8 w-full">
                <ResultDisplay exercises={exercises} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExercisePage;
