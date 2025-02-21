
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useToolMetrics } from '@/hooks/useToolMetrics';

interface GenerateLessonPlanParams {
  subject: string;
  classLevel: string;
  objective: string;
}

export function useLessonPlanGeneration() {
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const { logToolUsage } = useToolMetrics();

  const generateMutation = useMutation({
    mutationFn: async (params: GenerateLessonPlanParams) => {
      const startTime = Date.now();
      
      const { data, error } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          subject: params.subject,
          classLevel: params.classLevel,
          text: params.objective,
        }
      });

      if (error) {
        console.error('Error generating lesson plan:', error);
        throw new Error('Erreur lors de la génération de la séquence');
      }

      const generationTime = Date.now() - startTime;

      // Log l'utilisation de l'outil
      await logToolUsage(
        'lesson_plan',
        'generate',
        data.lessonPlan.length,
        generationTime
      );

      return data.lessonPlan;
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      toast({
        title: "Succès",
        description: "Votre séquence a été générée avec succès"
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la génération"
      });
    }
  });

  return {
    generateLessonPlan: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    generatedContent,
    setGeneratedContent
  };
}
