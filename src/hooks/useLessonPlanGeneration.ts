
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';
import { useSavedContent } from '@/hooks/useSavedContent';
import { useLocation, useBeforeUnload } from 'react-router-dom';

// Storage keys for form data and results
const FORM_STORAGE_KEY = 'lesson_plan_form_data';
const RESULT_STORAGE_KEY = 'lesson_plan_result_data';

interface LessonPlanFormData {
  classLevel: string;
  additionalInstructions: string;
  totalSessions: string;
  subject: string;
  subject_matter: string;
  text: string;
  lessonPlan: string;
}

export function useLessonPlanGeneration() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveLessonPlan } = useSavedContent();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LessonPlanFormData>(() => {
    // Load saved form data from localStorage on initial mount
    const savedFormData = localStorage.getItem(FORM_STORAGE_KEY);
    const savedResultData = localStorage.getItem(RESULT_STORAGE_KEY);
    
    const initialData = {
      classLevel: '',
      additionalInstructions: '',
      totalSessions: '',
      subject: '',
      subject_matter: '',
      text: '',
      lessonPlan: ''
    };
    
    if (savedFormData) {
      const parsedData = JSON.parse(savedFormData);
      Object.assign(initialData, parsedData);
    }
    
    if (savedResultData) {
      initialData.lessonPlan = savedResultData;
    }
    
    return initialData;
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (formData) {
      const dataToSave = { ...formData };
      delete dataToSave.lessonPlan; // Don't store result in form data
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
      
      // Store lesson plan separately
      if (formData.lessonPlan) {
        localStorage.setItem(RESULT_STORAGE_KEY, formData.lessonPlan);
      }
    }
  }, [formData]);

  // Handle intentional navigation away - clean storage when user explicitly navigates away
  useBeforeUnload(useCallback(() => {
    // Don't clear on page refresh (will be handled by beforeunload event)
    if (location.pathname !== '/lesson-plan') {
      localStorage.removeItem(FORM_STORAGE_KEY);
      localStorage.removeItem(RESULT_STORAGE_KEY);
    }
  }, [location]));

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const formatTitle = useCallback((title: string) => {
    return title.replace(/^Séquence[\s:-]+/i, '').trim();
  }, []);

  const resetLessonPlan = useCallback(() => {
    setFormData(prev => ({
      ...prev,
      lessonPlan: ''
    }));
    localStorage.removeItem(RESULT_STORAGE_KEY);
  }, []);

  const generateLessonPlan = useCallback(async () => {
    // Validation des champs obligatoires
    if (!formData.classLevel || !formData.totalSessions || !formData.subject_matter) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires de niveau, matière et nombre de séances."
      });
      return;
    }

    // Ajout de la validation des objectifs d'apprentissage (champ subject)
    if (!formData.subject || formData.subject.trim() === '') {
      toast({
        variant: "destructive",
        description: "Veuillez définir les objectifs d'apprentissage de votre séquence."
      });
      return;
    }

    setIsLoading(true);
    const startTime = performance.now();

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          classLevel: formData.classLevel,
          totalSessions: formData.totalSessions,
          subject: formData.subject,
          subject_matter: formData.subject_matter,
          text: formData.text,
          additionalInstructions: formData.additionalInstructions
        }
      });

      if (functionError) throw functionError;

      // Vérifier si nous avons une erreur spécifique renvoyée par la fonction
      if (functionData.error) {
        if (functionData.error === 'TIMEOUT_ERROR') {
          toast({
            variant: "destructive",
            title: "Temps de génération dépassé",
            description: "La génération est trop complexe. Essayez de réduire la complexité ou le nombre de séances."
          });
        } else {
          toast({
            variant: "destructive",
            description: functionData.message || "Une erreur est survenue lors de la génération."
          });
        }
        return;
      }

      const generationTime = Math.round(performance.now() - startTime);
      
      // Mise à jour du state avec le nouveau plan de leçon
      const newLessonPlan = functionData.lessonPlan;
      setFormData(prev => ({
        ...prev,
        lessonPlan: newLessonPlan
      }));

      // Save the result to localStorage
      localStorage.setItem(RESULT_STORAGE_KEY, newLessonPlan);

      // Sauvegarde automatique
      const title = formatTitle(`${formData.subject_matter} - ${formData.subject || ''} - ${formData.classLevel}`.trim());
      
      await saveLessonPlan({
        title,
        content: newLessonPlan,
        subject: formData.subject,
        subject_matter: formData.subject_matter,
        class_level: formData.classLevel,
        total_sessions: parseInt(formData.totalSessions),
        additional_instructions: formData.additionalInstructions
      });

      await logToolUsage('lesson_plan', 'generate', newLessonPlan.length, generationTime);

      toast({
        description: "🎉 Votre séquence a été générée et sauvegardée dans 'Mes ressources' !"
      });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: "Une erreur est survenue lors de la génération de la séquence. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  }, [formData, toast, logToolUsage, saveLessonPlan, formatTitle]);

  return {
    formData,
    isLoading,
    handleInputChange,
    generateLessonPlan,
    resetLessonPlan
  };
}
