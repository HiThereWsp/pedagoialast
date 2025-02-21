
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
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <LessonPlanForm
            formData={formData}
            isLoading={isLoading}
            onInputChange={handleInputChange}
            onGenerate={generateLessonPlan}
          />
        </div>
        <div className="xl:sticky xl:top-8 space-y-6">
          {formData.lessonPlan && (
            <ScrollCard 
              exercises={formData.lessonPlan}
              onBack={resetLessonPlan}
            />
          )}
        </div>
      </div>
    </div>
  );
}
