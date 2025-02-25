
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useToolMetrics } from '@/hooks/useToolMetrics';
import { useSavedContent } from '@/hooks/useSavedContent';

interface LessonPlanFormData {
  classLevel: string;
  additionalInstructions: string;
  totalSessions: string;
  subject: string;
  subject_matter?: string;
  text: string;
  lessonPlan: string;
}

// Clé utilisée pour stocker le formulaire dans sessionStorage
const FORM_STORAGE_KEY = 'lesson_plan_form_data';
const RESULT_STORAGE_KEY = 'lesson_plan_result_data';

export function useLessonPlanGeneration() {
  const { toast } = useToast();
  const { logToolUsage } = useToolMetrics();
  const { saveLessonPlan } = useSavedContent();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LessonPlanFormData>(() => {
    // Récupérer les données de formulaire depuis sessionStorage au chargement
    const savedForm = sessionStorage.getItem(FORM_STORAGE_KEY);
    const savedResult = sessionStorage.getItem(RESULT_STORAGE_KEY);
    
    if (savedForm) {
      const parsedForm = JSON.parse(savedForm) as LessonPlanFormData;
      // Si nous avons un résultat sauvegardé, l'ajouter au formulaire
      if (savedResult) {
        parsedForm.lessonPlan = savedResult;
      }
      return parsedForm;
    }
    
    return {
      classLevel: '',
      additionalInstructions: '',
      totalSessions: '',
      subject: '',
      subject_matter: '',
      text: '',
      lessonPlan: ''
    };
  });

  // Sauvegarder les données du formulaire dans sessionStorage à chaque changement
  useEffect(() => {
    const formToSave = { ...formData };
    // Ne pas stocker le plan de leçon dans la sauvegarde du formulaire
    const { lessonPlan, ...formWithoutResult } = formToSave;
    
    sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formWithoutResult));
    
    // Sauvegarder le résultat séparément s'il existe
    if (lessonPlan) {
      sessionStorage.setItem(RESULT_STORAGE_KEY, lessonPlan);
    }
  }, [formData]);

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
    sessionStorage.removeItem(RESULT_STORAGE_KEY);
  }, []);

  const generateLessonPlan = useCallback(async () => {
    if (!formData.classLevel || !formData.totalSessions || !formData.subject_matter) {
      toast({
        variant: "destructive",
        description: "Veuillez remplir tous les champs obligatoires."
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

      const generationTime = Math.round(performance.now() - startTime);
      
      // Mise à jour du state avec le nouveau plan de leçon
      const newLessonPlan = functionData.lessonPlan;
      setFormData(prev => ({
        ...prev,
        lessonPlan: newLessonPlan
      }));
      
      // Sauvegarde du résultat dans sessionStorage
      sessionStorage.setItem(RESULT_STORAGE_KEY, newLessonPlan);

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
        description: "Une erreur est survenue lors de la génération de la séquence."
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
