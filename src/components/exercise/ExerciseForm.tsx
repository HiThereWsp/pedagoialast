
import React, { useRef, useEffect, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Wand2, AlertTriangle } from "lucide-react";
import type { ExerciseFormData } from "@/types/saved-content";
import { LessonPlanSelect } from "./form/LessonPlanSelect";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ExerciseFormProps {
  formData: ExerciseFormData;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const ExerciseForm: React.FC<ExerciseFormProps> = ({ formData, handleInputChange, handleSubmit, isLoading }) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const validateForm = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Réinitialiser l'erreur avant validation
    setValidationError(null);
    
    if (!formData.objective.trim()) {
      setValidationError("L'objectif pédagogique est obligatoire");
      return;
    }

    handleSubmit(e);
  };

  return (
    <form 
      ref={formRef}
      onSubmit={validateForm} 
      className="relative z-10 max-w-4xl mx-auto space-y-6 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 ease-in-out"
    >
      {validationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6">
        <LessonPlanSelect 
          value={formData.selectedLessonPlan || ''} 
          onChange={handleInputChange}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-700">
              Matière <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Ex: Mathématiques"
              value={formData.subject}
              onChange={(e) => handleInputChange("subject", e.target.value)}
              required
              className="w-full transition-colors focus:border-pink-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="classLevel" className="text-gray-700">
              Niveau de classe <span className="text-red-500">*</span>
            </Label>
            <Input
              id="classLevel"
              placeholder="Ex: 6ème"
              value={formData.classLevel}
              onChange={(e) => handleInputChange("classLevel", e.target.value)}
              required
              className="w-full transition-colors focus:border-pink-300"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numberOfExercises" className="text-gray-700">Nombre d'exercices</Label>
              <Input
                id="numberOfExercises"
                type="number"
                min="1"
                placeholder="Ex: 3"
                value={formData.numberOfExercises}
                onChange={(e) => handleInputChange("numberOfExercises", e.target.value)}
                className="w-full transition-colors focus:border-pink-300"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionsPerExercise" className="text-gray-700">Questions par exercice</Label>
              <Input
                id="questionsPerExercise"
                type="number"
                min="1"
                placeholder="Ex: 5"
                value={formData.questionsPerExercise}
                onChange={(e) => handleInputChange("questionsPerExercise", e.target.value)}
                className="w-full transition-colors focus:border-pink-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exerciseType" className="text-gray-700">Type d'exercice</Label>
            <Select
              value={formData.exerciseType}
              onValueChange={(value) => handleInputChange("exerciseType", value)}
            >
              <SelectTrigger className="w-full transition-colors focus:border-pink-300">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Exercice d'entraînement</SelectItem>
                <SelectItem value="evaluation">Évaluation</SelectItem>
                <SelectItem value="review">Révision</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objective" className="text-gray-700 flex items-center gap-1">
              Objectif pédagogique <span className="text-red-500">*</span>
              {!formData.objective && (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </Label>
            <Textarea
              id="objective"
              placeholder="Décrivez l'objectif pédagogique de ces exercices"
              value={formData.objective}
              onChange={(e) => handleInputChange("objective", e.target.value)}
              className="w-full min-h-[100px] transition-colors focus:border-pink-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInstructions" className="text-gray-700">
              Instructions supplémentaires
            </Label>
            <Textarea
              id="additionalInstructions"
              placeholder="Instructions spécifiques pour les exercices"
              value={formData.additionalInstructions}
              onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
              className="w-full transition-colors focus:border-pink-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specificNeeds" className="text-gray-700">
              Besoins spécifiques des élèves
            </Label>
            <Textarea
              id="specificNeeds"
              placeholder="Ex: Adaptation pour élèves dyslexiques"
              value={formData.specificNeeds}
              onChange={(e) => handleInputChange("specificNeeds", e.target.value)}
              className="w-full transition-colors focus:border-pink-300"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-lg font-medium transition-all duration-300 transform hover:translate-y-[-2px] hover:shadow-lg flex items-center justify-center gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingIndicator />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              <span>Générer les exercices</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseForm;
