
import React from 'react';
import { FormFields } from './FormFields';
import type { ExerciseFormData } from "@/hooks/useExerciseGeneration";

interface DifferentiateExerciseFormProps {
  formData: ExerciseFormData;
  handleInputChange: (field: string, value: string) => void;
}

export function DifferentiateExerciseForm({ formData, handleInputChange }: DifferentiateExerciseFormProps) {
  console.log("DifferentiateExerciseForm received formData:", formData);
  
  return (
    <div className="space-y-6">
      <FormFields.OriginalExercise value={formData.originalExercise} onChange={handleInputChange} />
      <FormFields.Subject value={formData.subject} onChange={handleInputChange} />
      <FormFields.ClassLevel value={formData.classLevel} onChange={handleInputChange} />
      <FormFields.Objective value={formData.objective} onChange={handleInputChange} />
      <FormFields.StudentProfile value={formData.studentProfile} onChange={handleInputChange} />
      <FormFields.LearningDifficulties value={formData.learningDifficulties} onChange={handleInputChange} />
    </div>
  );
}
