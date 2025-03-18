
import React from 'react';
import { Subject } from './fields/Subject';
import { ClassLevel } from './fields/ClassLevel';
import { NumberOfExercises } from './fields/NumberOfExercises';
import { QuestionsPerExercise } from './fields/QuestionsPerExercise';
import { Objective } from './fields/Objective';
import { ExerciseType } from './fields/ExerciseType';
import { AdditionalInstructions } from './fields/AdditionalInstructions';
import { Textarea } from "@/components/ui/textarea";

interface GenerateExerciseFormProps {
  formData: {
    subject: string;
    classLevel: string;
    numberOfExercises: string;
    questionsPerExercise: string;
    objective: string;
    exerciseType: string;
    additionalInstructions: string;
    specificNeeds: string;
  };
  handleInputChange: (field: string, value: string) => void;
  isLessonPlanSelected: boolean;
}

export function GenerateExerciseForm({ formData, handleInputChange, isLessonPlanSelected }: GenerateExerciseFormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Subject 
          value={formData.subject} 
          onChange={handleInputChange}
          disabled={false} // Always allow editing the subject
        />
        <ClassLevel 
          value={formData.classLevel} 
          onChange={handleInputChange}
          disabled={false} // Always allow editing the class level
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <NumberOfExercises value={formData.numberOfExercises} onChange={handleInputChange} />
        <QuestionsPerExercise value={formData.questionsPerExercise} onChange={handleInputChange} />
      </div>

      <div className="space-y-6">
        <Objective value={formData.objective} onChange={handleInputChange} />
        <ExerciseType value={formData.exerciseType} onChange={handleInputChange} />
        <AdditionalInstructions value={formData.additionalInstructions} onChange={handleInputChange} />
        
        {formData.specificNeeds !== undefined && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Besoins spécifiques des élèves
            </label>
            <Textarea
              placeholder="Ex: Adaptation pour élèves dyslexiques"
              value={formData.specificNeeds}
              onChange={(e) => handleInputChange("specificNeeds", e.target.value)}
              className="min-h-[100px] w-full transition-colors focus:border-pink-300"
            />
          </div>
        )}
      </div>
    </>
  );
}
