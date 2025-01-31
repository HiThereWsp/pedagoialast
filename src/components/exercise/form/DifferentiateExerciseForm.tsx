import React from 'react';
import { Textarea } from "@/components/ui/textarea";
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
    specificNeeds: string;
  };
  handleInputChange: (field: string, value: string) => void;
}

export function DifferentiateExerciseForm({ formData, handleInputChange }: DifferentiateExerciseFormProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Exercice original <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Collez ici l'exercice que vous souhaitez adapter..."
          value={formData.originalExercise}
          onChange={(e) => handleInputChange("originalExercise", e.target.value)}
          className="min-h-[150px] w-full border-gray-200 focus:border-purple-500 focus:ring-purple-500 transition-colors"
          required
        />
      </div>

      <FormFields.Subject value={formData.subject} onChange={handleInputChange} />
      <FormFields.ClassLevel value={formData.classLevel} onChange={handleInputChange} />
      <FormFields.Objective value={formData.objective} onChange={handleInputChange} />
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profil ou niveau de l'élève <span className="text-red-500">*</span>
        </label>
        <Textarea
          placeholder="Décrivez les caractéristiques de l'élève ou son niveau..."
          value={formData.studentProfile}
          onChange={(e) => handleInputChange("studentProfile", e.target.value)}
          className="min-h-[100px] w-full"
          required
        />
      </div>

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

      <FormFields.SpecificNeeds value={formData.specificNeeds} onChange={handleInputChange} />
    </>
  );
}