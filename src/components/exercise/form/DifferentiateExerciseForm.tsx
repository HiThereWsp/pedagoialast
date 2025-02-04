import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormFields } from './FormFields';

interface DifferentiateExerciseFormProps {
  formData: {
    originalExercise: string;
    subject: string;
    classLevel: string;
    objective: string;
    studentProfile: string;
    learningStyle: string;
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Style d'apprentissage
        </label>
        <Select
          value={formData.learningStyle}
          onValueChange={(value) => handleInputChange("learningStyle", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choisissez un style d'apprentissage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="visual">Visuel</SelectItem>
            <SelectItem value="auditory">Auditif</SelectItem>
            <SelectItem value="kinesthetic">Kinesthésique</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </>
  );
}