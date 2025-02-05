import React from 'react';
import { FormFields } from './FormFields';

interface DifferentiateExerciseFormProps {
  formData: {
    originalExercise: string;
    subject: string;
    classLevel: string;
    objective: string;
    studentProfile: string;
    learningDifficulties: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function DifferentiateExerciseForm({ formData, handleInputChange }: DifferentiateExerciseFormProps) {
  return (
    <div className="space-y-6">
      <FormFields.OriginalExercise value={formData.originalExercise} onChange={handleInputChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFields.Subject value={formData.subject} onChange={handleInputChange} />
        <FormFields.ClassLevel value={formData.classLevel} onChange={handleInputChange} />
      </div>

      <FormFields.Objective value={formData.objective} onChange={handleInputChange} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormFields.StudentProfile value={formData.studentProfile} onChange={handleInputChange} />
        <FormFields.LearningDifficulties value={formData.learningDifficulties} onChange={handleInputChange} />
      </div>
    </div>
  );
}