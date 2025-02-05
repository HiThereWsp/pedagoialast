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
    <>
      <FormFields.OriginalExercise value={formData.originalExercise} onChange={handleInputChange} />
      <FormFields.Subject value={formData.subject} onChange={handleInputChange} />
      <FormFields.ClassLevel value={formData.classLevel} onChange={handleInputChange} />
      <FormFields.Objective value={formData.objective} onChange={handleInputChange} />
      <FormFields.StudentProfile value={formData.studentProfile} onChange={handleInputChange} />
      <FormFields.LearningDifficulties value={formData.learningDifficulties} onChange={handleInputChange} />
    </>
  );
}