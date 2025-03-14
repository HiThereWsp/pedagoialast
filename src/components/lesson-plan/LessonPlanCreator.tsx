
import React, { useRef, useEffect } from 'react';
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
    isLoading,
    handleInputChange,
    generateLessonPlan,
    resetLessonPlan
  } = useLessonPlanGeneration();

  useEffect(() => {
    if (formData.lessonPlan && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [formData.lessonPlan]);

  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto">
        <LessonPlanForm
          formData={formData}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onGenerate={generateLessonPlan}
        />
      </div>
      
      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-md">
            <LoadingIndicator />
          </div>
        </div>
      )}
      
      {formData.lessonPlan && !isLoading && (
        <div ref={scrollRef} className="max-w-6xl mx-auto mt-10">
          <ScrollCard 
            exercises={formData.lessonPlan}
            showCorrection={false}
            className={`min-h-[800px] ${isMobile ? 'p-4' : 'p-8 md:p-12'} animate-fade-in`}
            customClass="text-left"
          />
        </div>
      )}
    </div>
  );
}
