
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { BackButton } from "@/components/settings/BackButton";
import { ScrollCard } from '@/components/exercise/result/ScrollCard';
import { useExerciseGeneration } from '@/hooks/useExerciseGeneration';
import { useSavedContent } from '@/hooks/useSavedContent';
import { SEO } from "@/components/SEO";
import { ContentHistory } from '@/components/history/ContentHistory';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { exercisesService } from '@/services/exercises';

const ExercisePage = () => {
  const { isLoading: isGenerating, generateExercises } = useExerciseGeneration();
  const { saveExercise } = useSavedContent();
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [lastSaveTimestamp, setLastSaveTimestamp] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupération des exercices avec React Query
  const { data: savedExercises = [], isLoading: isLoadingExercises } = useQuery({
    queryKey: ['saved-exercises'],
    queryFn: async () => {
      const exercises = await exercisesService.getAll();
      return exercises.map(ex => ({
        ...ex,
        type: 'exercise',
        tags: [{
          label: 'Exercice',
          color: '#22C55E',
          backgroundColor: '#22C55E20',
          borderColor: '#22C55E4D'
        }]
      }));
    },
    enabled: !isAuthChecking,
    gcTime: 5 * 60 * 1000,
    staleTime: 30000
  });
  
  const [formData, setFormData] = useState({
    subject: '',
    classLevel: '',
    numberOfExercises: '3',
    questionsPerExercise: '5',
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
    selectedLessonPlan: '',
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    console.log("🔵 Début de la génération d'exercices");
    
    try {
      const exerciseParams = {
        ...formData,
        numberOfExercises: formData.numberOfExercises,
        questionsPerExercise: formData.questionsPerExercise
      };
      
      const generatedExercises = await generateExercises(exerciseParams);
      
      if (generatedExercises) {
        setCurrentExercise(generatedExercises);
        
        const currentTime = Date.now();
        if (lastSaveTimestamp && currentTime - lastSaveTimestamp < 300000) {
          return;
        }
        setLastSaveTimestamp(currentTime);
        
        const title = `${formData.subject} - ${formData.objective} - ${formData.classLevel}`;
        
        try {
          await saveExercise({
            title,
            content: generatedExercises,
            subject: formData.subject,
            class_level: formData.classLevel,
            exercise_type: formData.exerciseType,
            exercise_category: formData.specificNeeds ? 'differentiated' : 'standard',
            student_profile: formData.studentProfile,
            learning_style: formData.learningStyle,
            specific_needs: formData.specificNeeds
          });

          await queryClient.invalidateQueries({ queryKey: ['saved-exercises'] });

          toast({
            title: "Succès",
            description: "L'exercice a été généré avec succès"
          });
        } catch (error: any) {
          if (error.message && error.message.includes('Limite de contenu')) {
            toast({
              variant: "destructive",
              title: "Erreur de sauvegarde",
              description: "Vous avez atteint la limite de 15 contenus sauvegardés. Veuillez en supprimer avant d'en créer de nouveaux."
            });
          } else {
            console.error("❌ Erreur lors de la sauvegarde de l'exercice:", error);
            toast({
              variant: "destructive",
              title: "Erreur",
              description: "Une erreur est survenue lors de la sauvegarde de l'exercice"
            });
          }
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la génération:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération de l'exercice"
      });
    }
  };

  const handleExerciseClick = (exercise: any) => {
    setCurrentExercise(exercise.content);
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
        title="Générateur d'exercices | PedagoIA"
        description="Créez facilement des exercices personnalisés et adaptés avec notre générateur intelligent."
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

        <div className="mt-12">
          {isLoadingExercises ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ContentHistory
              title="Mes exercices générés"
              type="Exercice"
              items={savedExercises}
              onItemClick={handleExerciseClick}
              emptyMessage="Aucun exercice n'a encore été créé. Commencez à générer des exercices adaptés à vos besoins !"
              colorScheme={{
                color: '#22C55E',
                backgroundColor: '#22C55E20',
                borderColor: '#22C55E4D'
              }}
            />
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 gap-8">
            <ExerciseForm 
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isGenerating}
            />
            
            {currentExercise && (
              <ScrollCard 
                exercises={currentExercise}
                onBack={() => setCurrentExercise(null)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ExercisePage;
