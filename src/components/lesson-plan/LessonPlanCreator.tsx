
import React, { useRef, useEffect } from 'react';
import { LessonPlanForm } from './LessonPlanForm';
import { ScrollCard } from '@/components/exercise/result/ScrollCard';
import { useLessonPlanGeneration } from '@/hooks/useLessonPlanGeneration';

export function LessonPlanCreator() {
  const scrollRef = useRef<HTMLDivElement>(null);
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
    <div className="space-y-8">
      <div className="max-w-4xl mx-auto">
        <LessonPlanForm
          formData={formData}
          isLoading={isLoading}
          onInputChange={handleInputChange}
          onGenerate={generateLessonPlan}
        />
      </div>
      
      {formData.lessonPlan && (
        <div ref={scrollRef} className="max-w-6xl mx-auto mt-12">
          <ScrollCard 
            exercises={formData.lessonPlan}
            showCorrection={false}
            className="min-h-[800px] p-8 md:p-12 animate-fade-in"
            customClass="text-left"
          />
        </div>
      )}
    </div>
  );
}
