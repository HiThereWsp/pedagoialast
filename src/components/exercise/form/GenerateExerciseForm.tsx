import React from 'react';
import { FormFields } from './FormFields';

interface GenerateExerciseFormProps {
  formData: {
    subject: string;
    classLevel: string;
    numberOfExercises: string;
    objective: string;
    exerciseType: string;
    additionalInstructions: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function GenerateExerciseForm({ formData, handleInputChange }: GenerateExerciseFormProps) {
  return (
    <>
      <FormFields.Subject value={formData.subject} onChange={handleInputChange} />
      <FormFields.ClassLevel value={formData.classLevel} onChange={handleInputChange} />
      <FormFields.NumberOfExercises value={formData.numberOfExercises} onChange={handleInputChange} />
      <FormFields.Objective value={formData.objective} onChange={handleInputChange} />
      <FormFields.ExerciseType value={formData.exerciseType} onChange={handleInputChange} />
      <FormFields.AdditionalInstructions value={formData.additionalInstructions} onChange={handleInputChange} />
    </>
  );
}