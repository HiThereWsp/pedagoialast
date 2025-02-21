
import React from 'react';
import { FormFields } from './FormFields';

interface GenerateExerciseFormProps {
  formData: {
    subject: string;
    classLevel: string;
    numberOfExercises: string;
    questionsPerExercise: string;
    objective: string;
    exerciseType: string;
    additionalInstructions: string;
  };
  handleInputChange: (field: string, value: string) => void;
  isLessonPlanSelected: boolean;
}

export function GenerateExerciseForm({ formData, handleInputChange, isLessonPlanSelected }: GenerateExerciseFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormFields.Subject 
          value={formData.subject} 
          onChange={handleInputChange}
          disabled={isLessonPlanSelected}
        />
        <FormFields.ClassLevel 
          value={formData.classLevel} 
          onChange={handleInputChange}
          disabled={isLessonPlanSelected}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <FormFields.NumberOfExercises value={formData.numberOfExercises} onChange={handleInputChange} />
        <FormFields.QuestionsPerExercise value={formData.questionsPerExercise} onChange={handleInputChange} />
      </div>

      <div className="space-y-6">
        <FormFields.Objective value={formData.objective} onChange={handleInputChange} />
        <FormFields.ExerciseType value={formData.exerciseType} onChange={handleInputChange} />
        <FormFields.AdditionalInstructions value={formData.additionalInstructions} onChange={handleInputChange} />
      </div>
    </>
  );
}
