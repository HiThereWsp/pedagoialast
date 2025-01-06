import React from 'react';
import { LessonPlanCreator } from '@/components/lesson-plan/LessonPlanCreator';

export function LessonPlanPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LessonPlanCreator />
    </div>
  );
}