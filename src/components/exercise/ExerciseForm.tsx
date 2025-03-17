
import React, { useState, useEffect } from 'react';
import type { ExerciseFormData } from "@/types/saved-content";
import { FormContainer } from "./form/FormContainer";
import { ValidationAlert } from "./form/ValidationAlert";
import { SubmitButton } from "./form/SubmitButton";
import { LessonPlanSelect } from "./form/LessonPlanSelect";
import { GenerateExerciseForm } from "./form/GenerateExerciseForm";

export interface ExerciseFormProps {
  formData: ExerciseFormData;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ formData, handleInputChange, handleSubmit, isLoading }) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFormChanged, setIsFormChanged] = useState<boolean>(false);

  // Suivre les changements de formulaire
  useEffect(() => {
    setIsFormChanged(true);
  }, [formData]);

  const validateForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser l'erreur avant validation
    setValidationError(null);
    
    if (!formData.subject.trim()) {
      setValidationError("La matière est obligatoire");
      return;
    }
    
    if (!formData.classLevel.trim()) {
      setValidationError("Le niveau de classe est obligatoire");
      return;
    }
    
    if (!formData.objective.trim()) {
      setValidationError("L'objectif pédagogique est obligatoire");
      return;
    }

    // Réinitialiser l'indicateur de changement
    setIsFormChanged(false);
    
    // Soumettre le formulaire
    handleSubmit(e);
  };

  return (
    <FormContainer onSubmit={validateForm}>
      <ValidationAlert error={validationError} />
      
      <div className="space-y-6">
        <LessonPlanSelect 
          value={formData.selectedLessonPlan || ''} 
          onChange={handleInputChange}
        />

        <GenerateExerciseForm 
          formData={formData} 
          handleInputChange={handleInputChange} 
          isLessonPlanSelected={!!formData.selectedLessonPlan}
        />

        <SubmitButton isLoading={isLoading} />
      </div>
    </FormContainer>
  );
};

export default ExerciseForm;
