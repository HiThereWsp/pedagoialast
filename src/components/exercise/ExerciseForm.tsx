
import React, { useRef, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Wand2 } from "lucide-react";
import type { ExerciseFormData } from "@/types/saved-content";

export interface ExerciseFormProps {
  formData: ExerciseFormData;
  handleInputChange: (field: string, value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

const ExerciseForm = ({ formData, handleInputChange, handleSubmit, isLoading }: ExerciseFormProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  // Scroll to form when mounting
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <form 
      ref={formRef}
      onSubmit={handleSubmit} 
      className="relative z-10 max-w-4xl mx-auto space-y-6 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300 ease-in-out"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-gray-700">Matière</Label>
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
            <Label htmlFor="classLevel" className="text-gray-700">Niveau de classe</Label>
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
                required
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
                required
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
            <Label htmlFor="objective" className="text-gray-700">Objectif pédagogique</Label>
            <Textarea
              id="objective"
              placeholder="Décrivez l'objectif pédagogique de ces exercices"
              value={formData.objective}
              onChange={(e) => handleInputChange("objective", e.target.value)}
              className="min-h-[100px] w-full transition-colors focus:border-pink-300"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="additionalInstructions" className="text-gray-700">Instructions supplémentaires</Label>
            <Textarea
              id="additionalInstructions"
              placeholder="Ajoutez des instructions spécifiques si nécessaire"
              value={formData.additionalInstructions}
              onChange={(e) => handleInputChange("additionalInstructions", e.target.value)}
              className="min-h-[100px] w-full transition-colors focus:border-pink-300"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specificNeeds" className="text-gray-700">Besoins spécifiques</Label>
            <Textarea
              id="specificNeeds"
              placeholder="Précisez les besoins particuliers des élèves"
              value={formData.specificNeeds}
              onChange={(e) => handleInputChange("specificNeeds", e.target.value)}
              className="min-h-[100px] w-full transition-colors focus:border-pink-300"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white font-medium py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          {isLoading ? (
            <>
              <LoadingIndicator />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
              <span>Générer les exercices</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseForm;
