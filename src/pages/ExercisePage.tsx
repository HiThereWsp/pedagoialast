import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { BackButton } from "@/components/settings/BackButton";
import { ResultDisplay } from '@/components/exercise/ResultDisplay';
import { useExerciseGeneration } from '@/hooks/useExerciseGeneration';
import { useSavedContent } from '@/hooks/useSavedContent';
import { SEO } from "@/components/SEO";
import { HistoryCarousel } from '@/components/history/HistoryCarousel';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

const ExercisePage = () => {
  const { exercises, isLoading, generateExercises } = useExerciseGeneration();
  const { saveExercise, getSavedExercises } = useSavedContent();
  const [savedExercises, setSavedExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const navigate = useNavigate();
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
    strengths: '',
    challenges: '',
    originalExercise: '',
    studentProfile: '',
    learningStyle: '',
    learningDifficulties: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Erreur de session:", error);
          toast({
            variant: "destructive",
            title: "Erreur d'authentification",
            description: "Veuillez vous reconnecter."
          });
          navigate('/login');
          return;
        }

        if (!session) {
          navigate('/login');
          return;
        }

        setIsAuthChecking(false);
      } catch (error) {
        console.error("Erreur lors de la vérification de l'authentification:", error);
        navigate('/login');
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  useEffect(() => {
    const loadSavedExercises = async () => {
      if (isAuthChecking) return;
      
      try {
        const exercises = await getSavedExercises();
        setSavedExercises(exercises);
      } catch (error) {
        console.error('Error loading saved exercises:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les exercices sauvegardés."
        });
      }
    };

    loadSavedExercises();
  }, [getSavedExercises, isAuthChecking, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    const result = await generateExercises(formData);
    
    if (result && exercises) {
      await saveExercise({
        title: `Exercice ${formData.subject || ''} - ${formData.classLevel}`,
        content: exercises,
        subject: formData.subject,
        class_level: formData.classLevel,
        exercise_type: formData.exerciseType,
        difficulty_level: 'standard'
      });

      // Recharger les exercices sauvegardés après la génération
      const updatedExercises = await getSavedExercises();
      setSavedExercises(updatedExercises);
    }
  };

  const handleSelectExercise = (exercise) => {
    setSelectedExercise(exercise);
    setFormData(prev => ({
      ...prev,
      subject: exercise.subject || '',
      classLevel: exercise.class_level || '',
      exerciseType: exercise.exercise_type || '',
    }));
  };

  const transformExercisesToHistoryItems = (exercises) => {
    return exercises.map(exercise => ({
      id: exercise.id,
      title: exercise.title,
      content: exercise.content,
      subject: exercise.subject,
      created_at: exercise.created_at,
      tags: [{
        label: exercise.exercise_type || 'Exercice',
        color: '#FF9EBC',
        backgroundColor: '#FF9EBC20',
        borderColor: '#FF9EBC4D'
      }]
    }));
  };

  if (isAuthChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

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

        {savedExercises.length > 0 && (
          <div className="mb-8">
            <HistoryCarousel
              items={transformExercisesToHistoryItems(savedExercises)}
              onItemSelect={handleSelectExercise}
              selectedItemId={selectedExercise?.id}
            />
          </div>
        )}

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
