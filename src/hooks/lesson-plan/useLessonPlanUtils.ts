
import { useCallback } from 'react';
import { useSavedContent } from '@/hooks/useSavedContent';
import { useToolMetrics } from '@/hooks/useToolMetrics';
import { LessonPlanFormData, SaveLessonPlanParams } from './types';

export function useLessonPlanUtils() {
  const { saveLessonPlan } = useSavedContent();
  const { logToolUsage } = useToolMetrics();

  const formatTitle = useCallback((title: string) => {
    return title.replace(/^Séquence[\s:-]+/i, '').trim();
  }, []);

  const savePlan = useCallback(async (
    formData: LessonPlanFormData, 
    lessonPlan: string, 
    generationTime: number
  ) => {
    // Format the title
    const title = formatTitle(`${formData.subject_matter} - ${formData.subject || ''} - ${formData.classLevel}`.trim());
    
    // Save the lesson plan
    await saveLessonPlan({
      title,
      content: lessonPlan,
      subject: formData.subject,
      subject_matter: formData.subject_matter,
      class_level: formData.classLevel,
      total_sessions: parseInt(formData.totalSessions),
      additional_instructions: formData.additionalInstructions
    });

    // Log the tool usage
    await logToolUsage('lesson_plan', 'generate', lessonPlan.length, generationTime);
  }, [formatTitle, saveLessonPlan, logToolUsage]);

  return {
    formatTitle,
    savePlan
  };
}
