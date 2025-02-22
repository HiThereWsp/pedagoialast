
import React from 'react';
import { Button } from "@/components/ui/button";
import { LessonPlanSelect } from './form/LessonPlanSelect';

interface ExerciseFormProps {
  formData: {
    subject: string;
    classLevel: string;
    numberOfExercises: string;
    questionsPerExercise: string;
    objective: string;
    exerciseType: string;
    additionalInstructions: string;
    specificNeeds: string;
    originalExercise: string;
    studentProfile: string;
    learningDifficulties: string;
    selectedLessonPlan: string;
    challenges: string;
  };
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const ExerciseForm = ({ formData, handleInputChange, handleSubmit, isLoading }: ExerciseFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <LessonPlanSelect 
        value={formData.selectedLessonPlan}
        onChange={handleInputChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Matière
          </label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleInputChange('subject', e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Niveau de classe
          </label>
          <input
            type="text"
            value={formData.classLevel}
            onChange={(e) => handleInputChange('classLevel', e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre d'exercices
          </label>
          <input
            type="number"
            value={formData.numberOfExercises}
            onChange={(e) => handleInputChange('numberOfExercises', e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Questions par exercice
          </label>
          <input
            type="number"
            value={formData.questionsPerExercise}
            onChange={(e) => handleInputChange('questionsPerExercise', e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Objectif pédagogique
        </label>
        <textarea
          value={formData.objective}
          onChange={(e) => handleInputChange('objective', e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={3}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instructions additionnelles
        </label>
        <textarea
          value={formData.additionalInstructions}
          onChange={(e) => handleInputChange('additionalInstructions', e.target.value)}
          className="w-full p-2 border rounded-md"
          rows={3}
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? 'Génération en cours...' : 'Générer les exercices'}
      </Button>
    </form>
  );
};

export default ExerciseForm;
