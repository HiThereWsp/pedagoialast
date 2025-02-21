
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { ScrollCard } from '@/components/exercise/result/ScrollCard';
import { useExerciseGeneration } from '@/hooks/useExerciseGeneration';
import { useSavedContent } from '@/hooks/useSavedContent';
import { SEO } from "@/components/SEO";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { exercisesService } from '@/services/exercises';

const ExercisePage = () => {
  const { isLoading: isGenerating, generateExercises } = useExerciseGeneration();
  const { saveExercise } = useSavedContent();
  const [currentExercise, setCurrentExercise] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    
    const exerciseParams = {
      ...formData,
      numberOfExercises: formData.numberOfExercises,
      questionsPerExercise: formData.questionsPerExercise
    };
    
    const generatedExercises = await generateExercises(exerciseParams);
    
    if (generatedExercises) {
      try {
        setCurrentExercise(generatedExercises);
        
        const title = `${formData.subject} - ${formData.objective} - ${formData.classLevel}`;
        
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
          description: "L'exercice a été généré et sauvegardé avec succès"
        });
      } catch (error) {
        console.error("❌ Erreur lors de la sauvegarde de l'exercice:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Une erreur est survenue lors de la sauvegarde de l'exercice"
        });
      }
    }
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
        <Link to="/home" className="block mb-8">
          <img 
            src="/lovable-uploads/03e0c631-6214-4562-af65-219e8210fdf1.png" 
            alt="PedagoIA Logo" 
            className="w-[100px] h-[120px] object-contain mx-auto" 
          />
        </Link>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-[#F97316] to-[#D946EF] bg-clip-text text-transparent">
            Générateur d'exercices
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
            Créez facilement des exercices adaptés à vos besoins et objectifs d'apprentissage.
          </p>
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

