
import React, { useRef, useEffect, useMemo } from 'react';
import { LessonPlanForm } from './LessonPlanForm';
import { ScrollCard } from '@/components/exercise/result/ScrollCard';
import { useLessonPlanGeneration } from '@/hooks/useLessonPlanGeneration';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useIsMobile } from '@/hooks/use-mobile';

export function LessonPlanCreator() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const {
    formData,
    isGenerating,
    handleInputChange,
    generate,
    resetLessonPlan
  } = useLessonPlanGeneration();

  // Memoized content ID for feedback
  const contentId = useMemo(() => {
    // Generate a stable content ID if there's lesson plan content
    if (formData.lessonPlan) {
      return `lesson-plan-${Date.now()}`;
    }
    return undefined;
  }, [formData.lessonPlan]);

  useEffect(() => {
    if (formData.lessonPlan && scrollRef.current) {
      // Only scroll if the user has just generated a lesson plan (isLoading just turned false)
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [formData.lessonPlan]);

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <LessonPlanForm
          formData={formData}
          isLoading={isGenerating}
          onInputChange={handleInputChange}
          onGenerate={generate}
        />
      </div>
      
      {isGenerating && (
        <div className="flex justify-center py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <LoadingIndicator message="Création de votre séquence pédagogique..." />
          </div>
        </div>
      )}
      
      {formData.lessonPlan && !isGenerating && (
        <div ref={scrollRef} className="max-w-6xl mx-auto mt-10">
          <ScrollCard 
            exercises={formData.lessonPlan}
            showCorrection={false}
            className={`min-h-[800px] ${isMobile ? 'p-4' : 'p-8 md:p-12'} animate-fade-in`}
            customClass="text-left"
            disableInternalTabs={true}
            contentType="lesson_plan"
            contentId={contentId}
          />
        </div>
      )}
    </div>
  );
}
