
import React from 'react';
import { LessonPlanForm } from './LessonPlanForm';
import { ScrollCard } from '@/components/exercise/result/ScrollCard';
import { useLessonPlanGeneration } from '@/hooks/useLessonPlanGeneration';

export function LessonPlanCreator() {
  const {
    formData,
    isLoading,
    handleInputChange,
    generateLessonPlan,
    resetLessonPlan
  } = useLessonPlanGeneration();

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
        <div className="max-w-6xl mx-auto mt-12">
          <ScrollCard 
            exercises={formData.lessonPlan}
            onBack={resetLessonPlan}
            className="min-h-[800px] p-8 md:p-12 animate-fade-in"
          />
        </div>
      )}
    </div>
  );
}
