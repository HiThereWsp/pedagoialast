
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseForm } from '@/components/exercise/ExerciseForm';
import { BackButton } from "@/components/settings/BackButton";
import { ResultDisplay } from '@/components/exercise/ResultDisplay';
import { useExerciseGeneration } from '@/hooks/useExerciseGeneration';
import { useSavedContent } from '@/hooks/useSavedContent';
import { SEO } from "@/components/SEO";
import { ContentHistory } from '@/components/history/ContentHistory';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus } from "lucide-react";
import type { SavedContent } from '@/types/saved-content';

const ExercisePage = () => {
  const { exercises, isLoading, generateExercises } = useExerciseGeneration();
  const { saveExercise, getSavedExercises } = useSavedContent();
  const [savedExercises, setSavedExercises] = useState<SavedContent[]>([]);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [showForm, setShowForm] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    subject: '',
    classLevel: '',
    numberOfExercises: '1',
    questionsPerExercise: '3',
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
    lessonPlanId: '',
    lessonPlanContent: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const scrollToResult = () => {
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleNewExercise = () => {
    setShowForm(true);
    setFormData({
      subject: '',
      classLevel: '',
      numberOfExercises: '1',
      questionsPerExercise: '3',
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
      lessonPlanId: '',
      lessonPlanContent: ''
    });
  };

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
  }, [navigate, toast]);

  useEffect(() => {
    const loadSavedExercises = async () => {
      if (isAuthChecking) return;
      
      try {
        const exercises = await getSavedExercises();
        setSavedExercises(exercises.map(ex => ({
          ...ex,
          type: 'exercise' as const,
          tags: [{
            label: 'Exercice',
            color: '#22C55E',
            backgroundColor: '#22C55E20',
            borderColor: '#22C55E4D'
          }]
        })));
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

  const handleSubmit = async () => {
    const result = await generateExercises(formData);
    
    if (result && exercises) {
      try {
        await saveExercise({
          title: `Exercice ${formData.subject} - ${formData.classLevel} - ${formData.objective}`,
          content: exercises,
          subject: formData.subject,
          class_level: formData.classLevel,
          exercise_type: formData.exerciseType,
          difficulty_level: 'standard',
          source_lesson_plan_id: formData.lessonPlanId || undefined,
          source_type: formData.lessonPlanId ? 'from_lesson_plan' : 'direct'
        });

        setShowForm(false); // Rétracte le formulaire après la génération

        const updatedExercises = await getSavedExercises();
        setSavedExercises(updatedExercises.map(ex => ({
          ...ex,
          type: 'exercise' as const,
          tags: [{
            label: 'Exercice',
            color: '#22C55E',
            backgroundColor: '#22C55E20',
            borderColor: '#22C55E4D'
          }]
        })));

        scrollToResult();
        toast({
          title: "Succès",
          description: "L'exercice a été généré et sauvegardé avec succès."
        });
      } catch (error) {
        console.error('Error saving exercise:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de sauvegarder l'exercice."
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
            {showForm ? (
              <div className="w-full overflow-x-hidden">
                <ExerciseForm 
                  formData={formData}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleSubmit()}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#F97316] to-[#D946EF]"
                  disabled={isLoading}
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Régénérer
                </Button>
                <Button
                  onClick={handleNewExercise}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouvel exercice
                </Button>
              </div>
            )}
            {exercises && (
              <div ref={resultRef} className="xl:sticky xl:top-8 w-full space-y-4">
                <ResultDisplay exercises={exercises} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-12">
          <ContentHistory
            title="Mes exercices générés"
            type="Exercice"
            items={savedExercises}
            emptyMessage="Aucun exercice n'a encore été créé. Commencez à générer des exercices adaptés à vos besoins !"
            colorScheme={{
              color: '#22C55E',
              backgroundColor: '#22C55E20',
              borderColor: '#22C55E4D'
            }}
          />
        </div>
      </div>
    </>
  );
};

export default ExercisePage;
